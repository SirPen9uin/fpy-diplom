from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.db.utils import IntegrityError

from decouple import config

class Command(BaseCommand):
    help = "Создает начального администратора, если он не существует"

    def handle(self, *args, **kwargs):
        username = config('ADMIN_USER')
        email = config('ADMIN_EMAIL')
        password = config('ADMIN_PASSWORD')

        if not User.objects.filter(username=username).exists():
            try:
                User.objects.create_superuser(username, email, password)
                self.stdout.write(self.style.SUCCESS(f"Суперпользователь {username} создан."))
            except IntegrityError:
                self.stdout.write(self.style.ERROR(f"Ошибка при создании суперпользователя {username}."))
        else:
            self.stdout.write(f"Суперпользователь {username} уже существует.")
