import json
import os
import uuid

from django.http import JsonResponse, FileResponse

from django.views.decorators.csrf import csrf_exempt

from django.contrib.auth.decorators import login_required

from django.conf import settings

from django.shortcuts import get_object_or_404

from .models import File

UPLOAD_DIR = os.path.join(settings.MEDIA_ROOT, "uploads")

@csrf_exempt
@login_required
def upload_file(request):
    """Эндпоинт для загрузки файла"""
    if request.method != "POST":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    
    user = request.user
    
    file = request.FILES.get("file")
    if not file:
        return JsonResponse({"error": "Файл не предоставлен"}, status=400)
    
    comment = request.POST.get("comment", "")
    
    file_instance = File.objects.create(file=file, owner=user, comment=comment)
    
    return JsonResponse({
        "message": "Файл загружен",
        "file": file_instance.file.name,
        "comment": file_instance.comment
    })


@login_required
def list_files(request):
    """Эндпоинт для получения списка файлов"""
    if request.method != "GET":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    
    user = request.user

    files = File.objects.filter(owner=user)
    
    file_list = [
        {
            "name": file.file.name,
            "url": request.build_absolute_uri(file.file.url),
            "comment": file.comment,
            "external_link": file.external_link
        }
        for file in files
    ]
    return JsonResponse({"files": file_list}, status=200)

@csrf_exempt
@login_required
def download_file(request, filename):
    """Эндпоинт для скачивания файла"""
    if request.method != "GET":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    user = request.user

    try:
        file_instance = File.objects.get(file=f"uploads/{filename}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    file_path = file_instance.file.path
    return FileResponse(open(file_path, "rb"))


@csrf_exempt
@login_required
def delete_file(request, filename):
    if request.method != "DELETE":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    """Эндпоинт для удаления файла"""
    user = request.user

    try:
        file_instance = File.objects.get(file=f"uploads/{filename}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    file_path = file_instance.file.path
    os.remove(file_path)
    file_instance.delete()

    return JsonResponse({"message": "Файл удален"}, status=200)


@csrf_exempt
@login_required
def rename_file(request):
    """Эндпоинт для переименования файла"""
    if request.method != "POST" and request.method != "PATCH":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)

    user = request.user

    try:
        data = json.loads(request.body)
        old_name = data.get("old_name")
        new_name = data.get("new_name")
        print(old_name, new_name)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Ошибка парсинга данных"}, status=400)

    if not old_name or not new_name:
        return JsonResponse({"error": "Укажите старое и новое имя файла"}, status=400)

    try:
        file_instance = File.objects.get(file=f"uploads/{old_name}", owner=user)
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)

    new_path = os.path.join(settings.MEDIA_ROOT, "uploads", new_name)
    
    if os.path.exists(new_path):
        return JsonResponse({"error": "Файл с таким именем уже существует"}, status=400)

    os.rename(file_instance.file.path, new_path)

    file_instance.file.name = f"uploads/{new_name}"
    file_instance.save()

    return JsonResponse({"message": "Файл переименован", "new_name": new_name})

@csrf_exempt
@login_required
def update_comment(request, filename):
    """Эндпоинт для обновления комментария к файлу"""
    if request.method != "PATCH":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    
    user = request.user
    
    file = get_object_or_404(File, file="uploads/" + filename, owner=user)
    
    try:
        data = json.loads(request.body)
        new_comment = data.get("comment")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Неверный формат JSON"}, status=400)
    
    if new_comment is None:
        return JsonResponse({"error": "Комментарий не указан"}, status=400)
    
    file.comment = new_comment
    file.save()
    
    return JsonResponse({"message": "Комментарий обновлен", "comment": file.comment})


@csrf_exempt
@login_required
def generate_external_link(request, filename):
    """Эндпоинт для генерации специальной ссылки на файл"""
    if request.method != "POST":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    
    user = request.user
    
    file = get_object_or_404(File, file="uploads/" + filename, owner=user)
    
    file.external_link = str(uuid.uuid4())
    file.save()
    
    return JsonResponse({"message": "Ссылка создана", "external_link": request.build_absolute_uri(f"/storage/external/{file.external_link}/")})

@csrf_exempt
def download_via_external_link(request, external_link):
    """Эндпоинт для скачивания файла по специальной ссылке"""
    if request.method != "GET":
        return JsonResponse({"error": "Метод не поддерживается"}, status=405)
    file = get_object_or_404(File, external_link=external_link)
    file_path = os.path.join(settings.MEDIA_ROOT, file.file.name)
    
    if not os.path.exists(file_path):
        return JsonResponse({"error": "Файл не найден"}, status=404)
    
    return FileResponse(open(file_path, "rb"), as_attachment=True, filename=os.path.basename(file_path))
