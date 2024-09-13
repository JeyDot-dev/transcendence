from django.urls import include, path
from . import views

urlpatterns = [
    path('tournamentWinner/<int:t_id>/', views.tournamentWinner, name = 'tournamentWinner'),
    path('nextPool/<int:t_id>/', views.nextPool, name = 'nextPool'),
    path('newTournament/', views.newTournament, name='newTournament'),
    path('game_winner/<str:game_ws_id>/', views.game_winner, name='game_winner'),
    path('newGame/', views.newGame, name='newGame'),
    path('fetch_tournament/<int:t_id>/', views.get_old_tournament, name='fetch_tournament'),

]
