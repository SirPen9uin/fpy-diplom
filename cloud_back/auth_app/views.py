import json
import os

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.decorators import login_required

from django.http import JsonResponse, FileResponse

from django.views.decorators.csrf import csrf_exempt

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from django.conf import settings

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView


@csrf_exempt
def register(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            user = User.objects.create_user(
                username=data["username"],
                email=data["email"],
                password=data["password"],
            )
            return JsonResponse({"message": "Пользователь создан"}, status=201)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    return JsonResponse({"error": "Метод не поддерживается"}, status=405)


User = get_user_model()

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"error": "Укажите email и пароль"}, status=400)

            try:
                user = User.objects.get(email=email)
            except User.DoesNotExist:
                return JsonResponse({"error": "Пользователь не найден"}, status=400)

            user = authenticate(username=user.username, password=password)
            if user is None:
                return JsonResponse({"error": "Неверный пароль"}, status=400)

            # Получаем или создаем токен
            token, _ = Token.objects.get_or_create(user=user)
            return JsonResponse({"message": "Успешный вход", "token": token.key})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Метод не поддерживается"}, status=405)

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Доступ разрешен!", "user": request.user.username})
        

@api_view(['POST'])
def get_token(request):
    """Эндпоинт для получения токена"""
    username = request.data.get("username")
    password = request.data.get("password")

    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Неверные учетные данные"}, status=400)

    token, created = Token.objects.get_or_create(user=user)
    return Response({"token": token.key})