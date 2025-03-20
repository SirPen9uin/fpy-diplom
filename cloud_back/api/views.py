import json
import os

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse, FileResponse

from django.views.decorators.csrf import csrf_exempt

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView

from .serializers import FileSerializer
from .models import File


UPLOAD_DIR = "uploads/"

@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password=data["password"],
            )
            return JsonResponse({"message": "Пользователь создан"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Метод не поддерживается"}, status=405)


User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"error": "Укажите email и пароль"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Пользователь не найден"}, status=400)

            user = authenticate(username=user.username, password=password)
            if user is None:
                return JsonResponse({"error": "Неверный пароль"}, status=400)

            # Получаем или создаем токен
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse({"message": "Успешный вход", "token": token.key})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)


@csrf_exempt
def upload_file(request):
    """Эндпоинт для загрузки файла"""
    if request.method == "POST":
        token_key = request.headers.get("Authorization")
        if not token_key or not token_key.startswith("Token "):
            return JsonResponse({"error": "Требуется аутентификация"}, status=401)

        try:
            token = Token.objects.get(key=token_key.split(" ")[1])
            user = token.user
        except Token.DoesNotExist:
            return JsonResponse({"error": "Неверный токен"}, status=401)

        if "file" not in request.FILES:
            return JsonResponse({"error": "Файл не найден в запросе"}, status=400)

        file = request.FILES["file"]
        file_path = os.path.join(UPLOAD_DIR, f"{user.username}_{file.name}")
        default_storage.save(file_path, ContentFile(file.read()))

        return JsonResponse({"message": "Файл успешно загружен", "file_name": file.name}, status=201)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

@csrf_exempt
def exist_files(request):
    """Эндпоинт для получения списка файлов"""

    if request.method == "GET":
        token_key = request.headers.get("Authorization")
        print(f"Токен: {token_key}")  # Проверка получения заголовка

        if not token_key or not token_key.startswith("Token "):
            print("Ошибка: токен не предоставлен")
            return JsonResponse({"error": "Требуется аутентификация"}, status=401)

        try:
            token = Token.objects.get(key=token_key.split(" ")[1])
            user = token.user
            print(f"Авторизованный пользователь: {user.username}")  # Проверка аутентификации
        except Token.DoesNotExist:
            print("Ошибка: неверный токен")
            return JsonResponse({"error": "Неверный токен"}, status=401)

        # Полный путь к папке загрузок
        abs_path = os.path.join(settings.MEDIA_ROOT, "uploads")
        print(f"Папка загрузки: {abs_path}")  # Проверяем путь

        if not os.path.exists(abs_path):
            print("Папка отсутствует, возвращаем пустой список")
            return JsonResponse({"files": []}, status=200)

        # Список файлов, принадлежащих пользователю
        files = [
            {
                "name": f,
                "url": request.build_absolute_uri(settings.MEDIA_URL + "uploads/" + f),
            }
            for f in os.listdir(abs_path)
            if f.startswith(user.username)
        ]

        print(f"Найденные файлы: {files}")  # Вывод найденных файлов

        return JsonResponse({"files": files}, status=200)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

@csrf_exempt
def download_file(request, filename):
    """Эндпоинт для скачивания файла"""
    if request.method == "GET":
        token_key = request.headers.get("Authorization")
        if not token_key or not token_key.startswith("Token "):
            return JsonResponse({"error": "Требуется аутентификация"}, status=401)

        try:
            token = Token.objects.get(key=token_key.split(" ")[1])
            user = token.user
        except Token.DoesNotExist:
            return JsonResponse({"error": "Неверный токен"}, status=401)

        file_path = os.path.join(UPLOAD_DIR, filename)
        if not os.path.exists(file_path):
            return JsonResponse({"error": "Файл не найден"}, status=404)

        return FileResponse(open(file_path, "rb"))

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

@csrf_exempt
def delete_file(request, filename):
    """Эндпоинт для удаления файла"""
    if request.method == "DELETE":
        token_key = request.headers.get("Authorization")
        if not token_key or not token_key.startswith("Token "):
            return JsonResponse({"error": "Требуется аутентификация"}, status=401)

        try:
            token = Token.objects.get(key=token_key.split(" ")[1])
            user = token.user
        except Token.DoesNotExist:
            return JsonResponse({"error": "Неверный токен"}, status=401)

        file_path = os.path.join(settings.MEDIA_ROOT, "uploads", filename)

        if not os.path.exists(file_path):
            return JsonResponse({"error": "Файл не найден"}, status=404)

        # Проверяем, принадлежит ли файл пользователю
        if not filename.startswith(user.username):
            return JsonResponse({"error": "Нет прав на удаление"}, status=403)

        os.remove(file_path)
        return JsonResponse({"message": "Файл удален"}, status=200)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):

    files = File.objects.filter(owner=request.user)
    return Response(FileSerializer(files, many=True).data)

@api_view(['POST'])
def get_token(request):
    """Эндпоинт для получения токена"""
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Неверные учетные данные"}, status=400)

    token, created = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Доступ разрешен!", "user": request.user.username})