from django.urls import include, path
from . import views

urlpatterns = [
    path('play/<int:game_id>/', views.play, name='play'),
    path('winner/<int:game_id>/', views.winner, name='winner'),
    path('addPlayers/<int:t_id>/', views.addPlayers, name = 'addPlayers'),
    path('startTournament/<int:t_id>/', views.startTournament, name = 'startTournament'),
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),

    path('testTournament/', views.testTournament, name = 'testTournament'),
    path('testNextPool/', views.testNextPool, name = 'testNextPool'),

    #NOTE: Ancine route play/
    path('', views.newGame, name='newGame'),

    #NOTE: Ancine route play
    path('', views.newGame, name='newGame'),
]
