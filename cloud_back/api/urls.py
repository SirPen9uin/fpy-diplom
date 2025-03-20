from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from rest_framework.authtoken.views import obtain_auth_token

from .views import register, login_view, upload_file, get_token, ProtectedView, download_file, delete_file, exist_files

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('upload/', upload_file, name='upload'),
    path('files/', exist_files, name='list_files'),
    path('token/', obtain_auth_token, name='get_token'),
    path('protected/', ProtectedView.as_view(), name='protected'),
    path("files/<str:filename>/", download_file, name="download_file"),
    path("files/<str:filename>/delete/", delete_file, name="delete_file"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)