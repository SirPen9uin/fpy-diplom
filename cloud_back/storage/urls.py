from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from .views import upload_file, download_file, delete_file, list_files, rename_file, update_comment, generate_external_link, download_via_external_link


urlpatterns = [
    path('upload/', upload_file, name='upload'),
    path('files/', list_files, name='list_files'),
    path("files/rename/", rename_file, name="rename_file"),
    path("files/<str:filename>/", download_file, name="download_file"),
    path("files/<str:filename>/delete/", delete_file, name="delete_file"),
    path("files/<str:filename>/comment/", update_comment, name="update_comment"),
    path("files/<str:filename>/link/", generate_external_link, name="generate_external_link"),
    path("external/<str:external_link>/", download_via_external_link, name="download_via_external_link"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)