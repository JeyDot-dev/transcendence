from django.urls import path
from . import views

urlpatterns = [
	path('game/create_tournament', views.create_tournament, name='create_tournament'),
	path('game/create_game', views.create_game, name='create_game'),
    path('pong2d/', views.pong2d, name='pond2d'),
    path('', views.index, name='index'),
]
