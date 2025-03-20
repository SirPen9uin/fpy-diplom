from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .models import File
from .serializers import FileSerializer
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


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):

    file = request.FILES.get("file")
    if not file:
        return Response({"error": "Файл не найден"}, status=400)

    uploaded_file = File.objects.create(owner=request.user, file=file)
    return Response({"message": "Файл загружен", "file": FileSerializer(uploaded_file).data})

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_files(request):

    files = File.objects.filter(owner=request.user)
    return Response(FileSerializer(files, many=True).data)

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

class ProtectedView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Доступ разрешен!", "user": request.user.username})