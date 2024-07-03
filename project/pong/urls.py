from django.contrib import admin
from django.urls import path, include
from pong import views

urlpatterns = [
    path("", views.menu, name="home"),
    path("menu/", views.menu, name="menu"),
    path("game/", views.game, name="game"),
    path(
        "accounts/", include("django.contrib.auth.urls")
    ),  # Inclut les vues d'authentification
]
