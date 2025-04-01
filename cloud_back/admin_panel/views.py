from django.http import JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
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
    
    file_info = [{"name": file.file.name, "size": file.file.size} for file in files]
    total_size = sum(file["size"] for file in file_info)

    return JsonResponse({
        "user": user.username,
        "file_count": len(file_info),
        "total_size": total_size,
        "files": file_info,
    }, status=200)
