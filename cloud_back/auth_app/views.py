import json

from django.contrib.auth.models import User
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_POST

from django.middleware.csrf import get_token


@csrf_exempt
@require_POST
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
@require_POST
def login_view(request):
    try:
        data = json.loads(request.body)

        user = User.objects.filter(email=data['email']).first()
        if not user:
            print("Пользователь не найден")
            return JsonResponse({'detail': 'Invalid credentials'}, status=400)

        print(f"Найден пользователь: {user.username}")

        user = authenticate(username=user.username, password=data['password'])
        if not user:
            print("Ошибка аутентификации: неверный пароль")
            return JsonResponse({'detail': 'Invalid credentials'}, status=400)
    

        login(request, user)
        return JsonResponse({'detail': 'Login successful',
                             'username': user.username,
                             'email': user.email,
                             'id': user.id},)

    except Exception as e:
        print("Ошибка:", e)
        return JsonResponse({'detail': 'Server error'}, status=500)

@csrf_exempt
# @ensure_csrf_cookie
def csrf_token(request):
    csrf_token = get_token(request)  # Получаем CSRF токен
    return JsonResponse({'csrfToken': csrf_token})  # Отправляем токен в ответе

@csrf_exempt
@require_POST
def logout_view(request):
    try:
        logout(request)
        response = JsonResponse({"detail": "Logout successful"})
        response.delete_cookie("sessionid")
        return response
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    