from django.urls import path
from . import views

urlpatterns = [
    path('play/<int:game_id>/', views.play, name='play'),
    path('winner/<int:game_id>/', views.winner, name='winner'),

    #NOTE: Ancine route play/
    path('', views.newGame, name='newGame'),

    path('newTournament/', views.newTournament, name = 'newTournament'),
    path('addPlayers/<int:t_id>/', views.addPlayers, name = 'addPlayers'),
    path('startTournament/<int:t_id>/', views.startTournament, name = 'startTournament'),
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),
]
