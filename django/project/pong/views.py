from django.shortcuts import render, redirect
from .models import GameSettings
from .forms import GameSettingsForm


def menu(request):
    if request.user.is_authenticated:
        try:
            settings = request.user.gamesettings
        except GameSettings.DoesNotExist:
            settings = GameSettings(user=request.user)

        if request.method == "POST":
            form = GameSettingsForm(request.POST, instance=settings)
            if form.is_valid():
                form.save()
                return redirect("game")
        else:
            form = GameSettingsForm(instance=settings)

        return render(request, "pong/menu.html", {"form": form})
    else:
        # Utilisateur non authentifié
        return render(request, "pong/menu_anonymous.html")


def game(request):
    if request.user.is_authenticated:
        settings = request.user.gamesettings
        paddle_speed = settings.paddle_speed
        ball_speed = settings.ball_speed
        framerate = settings.framerate
    else:
        # Utilisateur non authentifié avec des paramètres par défaut
        paddle_speed = 10
        ball_speed = 5
        framerate = 60

    return render(
        request,
        "pong/game.html",
        {
            "paddle_speed": paddle_speed,
            "ball_speed": ball_speed,
            "framerate": framerate,
        },
    )
