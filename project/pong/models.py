from django.db import models
from django.contrib.auth.models import User

class GameSettings(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    paddle_speed = models.IntegerField(default=5)
    ball_speed = models.IntegerField(default=5)
    framerate = models.IntegerField(default=60)

    def __str__(self):
        return f"{self.user.username}'s Game Settings"
