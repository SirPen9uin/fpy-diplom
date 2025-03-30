from django.urls import path

from django.conf import settings
from django.conf.urls.static import static

from rest_framework.authtoken.views import obtain_auth_token

from .views import register, login_view, csrf_token

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('csrf/', csrf_token, name='csrf_token'),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)