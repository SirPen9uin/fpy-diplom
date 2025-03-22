from django.db import models
from django.contrib.auth.models import User

# Create your models here.

def user_directory_path(instance, filename): 
    return f'user_{instance.owner.id}/{filename}'


class File(models.Model):
    file = models.FileField(upload_to="uploads/")
    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.file.name} ({self.owner.username})"
