from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
	path('game/create_tournament', views.create_tournament, name='create_tournament'),
]
