from django.urls import include, path
from . import views

urlpatterns = [
    path('new_tournament/', views.new_tournament, name='new_tournament'),
    path('getPoolGames/<int:t_id>/', views.get_pool_games, name='get_pool_games'),
    path('nextPool/<int:t_id>/', views.next_pool, name='next_pool'),
    path('game_winner/<str:game_ws_id>/', views.get_game_winner, name='get_game_winner'),
]
