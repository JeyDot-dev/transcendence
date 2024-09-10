from django.urls import include, path
from . import views

urlpatterns = [
    path('play/<int:game_id>/', views.play, name='play'),
    path('winner/<int:game_id>/', views.winner, name='winner'),
    path('addPlayers/<int:t_id>/', views.addPlayers, name = 'addPlayers'),
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),
    path('NextPool/<int:t_id>/', views.NextPool, name = 'NextPool'),

    #NOTE: Ancine route play/
    path('', views.newGame, name='newGame'),

    #NOTE: Ancine route play
    path('', views.newGame, name='newGame'),
]
