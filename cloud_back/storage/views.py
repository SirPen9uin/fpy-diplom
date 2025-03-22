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
@api_view(["POST"])
def upload_file(request):
    """Эндпоинт для загрузки файла"""
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

    uploaded_file = request.FILES["file"]
    file_instance = File.objects.create(file=uploaded_file, owner=user)

    return JsonResponse({"message": "Файл загружен", "file": file_instance.file.name})

@csrf_exempt
@api_view(["GET"])
def list_files(request):
    """Эндпоинт для получения списка файлов пользователя"""
    token_key = request.headers.get("Authorization")

    if not token_key or not token_key.startswith("Token "):
        return JsonResponse({"error": "Требуется аутентификация"}, status=401)

    try:
        token = Token.objects.get(key=token_key.split(" ")[1])
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({"error": "Неверный токен"}, status=401)

    # Получаем файлы пользователя из базы
    files = File.objects.filter(owner=user)

    files_data = [
        {
            "name": file.file.name.split("/")[-1],
            "url": request.build_absolute_uri(file.file.url),
        }
        for file in files
    ]

    return JsonResponse({"files": files_data}, status=200)

@csrf_exempt
@api_view(["GET"])
def download_file(request, filename):
    """Эндпоинт для скачивания файла"""
    token_key = request.headers.get("Authorization")

    if not token_key or not token_key.startswith("Token "):
        return JsonResponse({"error": "Требуется аутентификация"}, status=401)

    try:
        token = Token.objects.get(key=token_key.split(" ")[1])
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({"error": "Неверный токен"}, status=401)

    # Ищем файл в базе
    try:
        file_instance = File.objects.get(file=f"uploads/{filename}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    file_path = file_instance.file.path
    return FileResponse(open(file_path, "rb"))


@csrf_exempt
@api_view(["DELETE"])
def delete_file(request, filename):
    """Эндпоинт для удаления файла"""
    token_key = request.headers.get("Authorization")

    if not token_key or not token_key.startswith("Token "):
        return JsonResponse({"error": "Требуется аутентификация"}, status=401)

    try:
        token = Token.objects.get(key=token_key.split(" ")[1])
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({"error": "Неверный токен"}, status=401)

    # Проверяем файл в базе
    try:
        file_instance = File.objects.get(file=f"uploads/{filename}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    file_path = file_instance.file.path
    os.remove(file_path)
    file_instance.delete()

    return JsonResponse({"message": "Файл удален"}, status=200)


@csrf_exempt
@api_view(["POST", "PATCH"])
def rename_file(request):
    """Эндпоинт для переименования файла"""
    token_key = request.headers.get("Authorization")

    if not token_key or not token_key.startswith("Token "):
        return JsonResponse({"error": "Требуется аутентификация"}, status=401)

    try:
        token = Token.objects.get(key=token_key.split(" ")[1])
        user = token.user
    except Token.DoesNotExist:
        return JsonResponse({"error": "Неверный токен"}, status=401)

    data = request.data
    old_name = data.get("old_name")
    new_name = data.get("new_name")

    if not old_name or not new_name:
        return JsonResponse({"error": "Укажите старое и новое имя файла"}, status=400)

    # Проверяем файл в базе
    try:
        file_instance = File.objects.get(file=f"uploads/{old_name}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    new_path = os.path.join(settings.MEDIA_ROOT, "uploads", new_name)
    
    if os.path.exists(new_path):
        return JsonResponse({"error": "Файл с таким именем уже существует"}, status=400)

    # Переименовываем файл
    os.rename(file_instance.file.path, new_path)
    
    # Обновляем запись в базе
    file_instance.file.name = f"uploads/{new_name}"
    file_instance.save()

    return JsonResponse({"message": "Файл переименован", "new_name": new_name})

