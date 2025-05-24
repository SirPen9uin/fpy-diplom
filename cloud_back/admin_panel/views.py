import os
from django.conf import settings
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.admin.views.decorators import staff_member_required

from django.shortcuts import get_object_or_404

from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser

import json

from storage.models import File

@api_view(["GET"])
@permission_classes([IsAdminUser])
def user_list(request):
    """Получение списка пользователей с их статусами и данными о файловом хранилище"""
    users = User.objects.all()
    user_data = []

    for user in users:
        files = File.objects.filter(owner=user)
        file_count = files.count()
        total_size = sum(file.file.size for file in files)  # Получаем размер файлов

        user_data.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "is_admin": user.is_staff,
            "file_count": file_count,
            "total_size": total_size,
            "storage_link": f"/admin/storage/{user.id}/" if file_count > 0 else None
        })

    return JsonResponse({"users": user_data}, status=200)

@csrf_exempt
@api_view(["PATCH"])
@permission_classes([IsAdminUser])
def update_admin_status(request, user_id):
    """Изменение статуса администратора у пользователя (только для суперпользователя)"""
    if not request.user.is_superuser:
        return JsonResponse({"error": "Только суперпользователь может назначать администраторов"}, status=403)

    user = get_object_or_404(User, id=user_id)

    if user.is_superuser:
        return JsonResponse({"error": "Нельзя изменить статус суперпользователя"}, status=403)

    try:
        data = json.loads(request.body)
        is_admin = data.get("is_admin")
    except json.JSONDecodeError:
        return JsonResponse({"error": "Неверный формат JSON"}, status=400)

    if is_admin is None:
        return JsonResponse({"error": "Не указан статус администратора"}, status=400)

    user.is_staff = is_admin
    user.save()
    
    return JsonResponse({"message": "Статус администратора обновлён", "is_admin": user.is_staff})

@csrf_exempt
@api_view(["DELETE"])
@permission_classes([IsAdminUser])
def delete_user(request, user_id):
    """Удаление пользователя и его файлов"""

    user = get_object_or_404(User, id=user_id)

    if user.is_superuser:
        return JsonResponse({"error": "Нельзя удалить суперпользователя"}, status=403)

    files = File.objects.filter(owner=user)
    for file in files:
        file.file.delete()
        file.delete()

    user.delete()
    return JsonResponse({"message": "Пользователь и его файлы удалены"}, status=200)

@api_view(["GET"])
@permission_classes([IsAdminUser])
def user_storage_info(request, user_id):
    """Получение информации о файлах пользователя"""
    user = get_object_or_404(User, id=user_id)
    files = File.objects.filter(owner=user)
    
    file_info = [{"name": file.file.name, "size": file.file.size, "comment": file.comment, "id": file.id, "uploadedAt": file.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")} for file in files]
    total_size = sum(file["size"] for file in file_info)

    return JsonResponse({
        "user": user.username,
        "file_count": len(file_info),
        "total_size": total_size,
        "files": file_info,
    }, status=200)


@staff_member_required
@csrf_exempt
@require_http_methods(["PATCH"])
def rename_file(request, user_id, file_id):
    try:
        data = json.loads(request.body)
        new_name = data.get("name")
        if not new_name:
            return JsonResponse({"error": "Новое имя не указано"}, status=400)

        file_instance = File.objects.get(id=file_id, owner_id=user_id)
        old_path = file_instance.file.path
        new_path = os.path.join(settings.MEDIA_ROOT, "uploads", new_name)

        if os.path.exists(new_path):
            return JsonResponse({"error": "Файл с таким именем уже существует"}, status=400)

        os.rename(old_path, new_path)

        file_instance.file.name = f"uploads/{new_name}"
        file_instance.name = new_name
        file_instance.save()

        return JsonResponse({"detail": "Файл переименован", "new_name": new_name})
    except File.DoesNotExist:
        print(f"Файл не найден: old_name={old_path}, new_name={new_name}")
        return JsonResponse({"error": "Файл не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@staff_member_required
@csrf_exempt
@require_http_methods(["PATCH"])
def update_file_comment(request, user_id, file_id):
    try:
        data = json.loads(request.body)
        new_comment = data.get("new_comment")
        if new_comment is None:
            return JsonResponse({"error": "Комментарий не указан"}, status=400)

        file = File.objects.get(id=file_id, owner_id=user_id)
        file.comment = new_comment
        file.save()

        return JsonResponse({"detail": "Комментарий обновлен"})
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    

@staff_member_required
@csrf_exempt
@require_http_methods(["DELETE"])
def delete_file_admin(request, user_id, file_id):
    try:
        file = File.objects.get(id=file_id, owner_id=user_id)
        file.delete()
        
        return JsonResponse({"detail": "Файл удален"})
    except File.DoesNotExist:
        return JsonResponse({"error": "Файл не найден"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)