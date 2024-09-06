from django.urls import path
from . import views

urlpatterns = [
	path('game/create_tournament', views.create_tournament, name='create_tournament'),
    path('pong2d/', views.pong2d, name='pond2d'),
    path('localGame/', views.launchLocalGame, name='localGame'),
    path('', views.index, name='index'),
]
