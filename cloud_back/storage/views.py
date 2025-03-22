import os

from django.http import JsonResponse, FileResponse

from django.views.decorators.csrf import csrf_exempt

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from django.conf import settings

from rest_framework.decorators import api_view
from rest_framework.authtoken.models import Token

from .serializers import FileSerializer
from .models import File

UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, "uploads")

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
def list_files(request):
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
        if user.username not in filename:
            return JsonResponse({"error": "Нет прав на удаление"}, status=403)

        os.remove(file_path)
        return JsonResponse({"message": "Файл удален"}, status=200)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

@csrf_exempt
@api_view(['POST', 'PATCH'])
def rename_file(request):
    if request.method not in ["POST", "PATCH"]:
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    
    token_key = request.headers.get("Authorization")
    if not token_key or not token_key.startswith("Token "):
        return JsonResponse({"error": "Требуется аутентификация"}, status=401)
    
    try:
        token = Token.objects.get(key=token_key.split(" ")[1])
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({"error": "Неверный токен"}, status=401)
    
    data = request.data  # Используем request.data вместо request.POST (POST не передаёт JSON)
    old_name = data.get("old_name")
    new_name = data.get("new_name")
    
    if not old_name or not new_name:
        return JsonResponse({"error": "Укажите старое и новое имя файла"}, status=400)
    
    old_path = os.path.join(UPLOAD_DIR, old_name)
    new_path = os.path.join(UPLOAD_DIR, new_name)
    
    if not os.path.exists(old_path):
        return JsonResponse({"error": "Файл не найден"}, status=404)
    
    if os.path.exists(new_path):
        return JsonResponse({"error": "Файл с таким именем уже существует"}, status=400)
    
    os.rename(old_path, new_path)
    
    return JsonResponse({"message": "Файл переименован", "new_name": new_name})
