from django.urls import include, path
from . import views

urlpatterns = [
    path('winner/<int:game_id>/', views.winner, name='winner'),
    path('addPlayers/<int:t_id>/', views.addPlayers, name = 'addPlayers'),
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),
    path('nextPool/<int:t_id>/', views.nextPool, name = 'nextPool'),
    path('newTournament/', views.newTournament, name='newTournament'),
    path('game_winner/<str:game_ws_id>/', views.game_winner, name='game_winner'),

    #NOTE: Ancine route play/
    path('', views.newGame, name='newGame'),

    #NOTE: Ancine route play
    path('', views.newGame, name='newGame'),
]
