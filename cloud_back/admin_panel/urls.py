from django.urls import path
from .views import user_list, update_admin_status, delete_user, user_storage_info

urlpatterns = [
    path("users/", user_list, name="user_list"),
    path("users/<int:user_id>/admin/", update_admin_status, name="update_admin_status"),  # Изменение статуса админа
    path("users/<int:user_id>/delete/", delete_user, name="delete_user"),  # Удаление пользователя
    path("users/<int:user_id>/storage/", user_storage_info, name="user_storage_info"),  # Информация о файлах пользователя
]
