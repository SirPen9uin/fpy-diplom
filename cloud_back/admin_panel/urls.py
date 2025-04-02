from django.urls import path
from .views import user_list, update_admin_status, delete_user, user_storage_info, rename_file, update_file_comment, delete_file_admin

urlpatterns = [
    path("users/", user_list, name="user_list"),
    path("users/<int:user_id>/admin/", update_admin_status, name="update_admin_status"),
    path("users/<int:user_id>/delete/", delete_user, name="delete_user"),
    path("users/<int:user_id>/storage/", user_storage_info, name="user_storage_info"),
    path("users/<int:user_id>/storage/<int:file_id>/rename/", rename_file, name="rename_file"),
    path("users/<int:user_id>/storage/<int:file_id>/comment/", update_file_comment, name="update_file_comment"),
    path("users/<int:user_id>/storage/<int:file_id>/delete/", delete_file_admin, name="delete_file_admin"),

]
