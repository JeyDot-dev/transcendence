from django.urls import path
from . import views

urlpatterns = [
    path('newTournament/', views.newTournament, name = 'newTournament'),

    path('play/<int:game_id>/', views.play, name='play'),
    path('winner/<int:game_id>/', views.winner, name='winner'),
    path('addPlayers/<int:t_id>/', views.addPlayers, name = 'addPlayers'),
    path('startTournament/<int:t_id>/', views.startTournament, name = 'startTournament'),
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),

    path('testTournament/', views.testTournament, name = 'testTournament'),

    #NOTE: Ancine route play/
    path('', views.newGame, name='newGame'),
]
