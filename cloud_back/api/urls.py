from django.urls import path
from .views import register, login_view, upload_file, list_files, get_token, ProtectedView
from rest_framework.authtoken.views import obtain_auth_token

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('upload/', upload_file, name='upload'),
    path('files/', list_files, name='list_files'),
    path('token/', obtain_auth_token, name='get_token'),
    path('protected/', ProtectedView.as_view(), name='protected'),
]