from django.shortcuts import render
from django.db.models import F, Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from django.template import loader
import random, string
import logging

logger = logging.getLogger(__name__)

from .models import Game, Player, Tournament
from .forms import *
# Create your views here.

def tournamentWinner(request, t_id):
    tourny = get_object_or_404(Tournament, pk=t_id)
    tourny.winner = tourny.players.get(is_winner=True) 


def newGame(request):
    form = newGameForm(request.POST)
    if form.is_valid():
        player1_name = form.cleaned_data['player1_name']
        player2_name = form.cleaned_data['player2_name']
        player1, new1= Player.objects.get_or_create(name=player1_name)
        player2, new1 = Player.objects.get_or_create(name=player2_name)
        player1.is_winner = False
        player2.is_winner = False 
        player1.save()
        player2.save()
        game = Game.objects.create(player1=player1, player2=player2)
        return redirect("play", game_id = game.id)
    return render(request, 'database/newgame.html', {'form': form})

def newTournament(request):
    if request.method == 'POST':
        Tform = newTournamentForm(request.POST)
        formset = PlayerFormSet(request.POST)
        if Tform.is_valid() and formset.is_valid():
            logger.info(f"______Forms valid_______")
            tournament = Tournament(name=Tform.cleaned_data['tournament_title'])
            tournament.save()
            for form in formset:
                player_name = form.cleaned_data.get('name')
                if player_name:
                    player, created = Player.objects.get_or_create(name=player_name)
                    player.is_winner = True
                    player.save()
                    tournament.players.add(player)
            tournament.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                players = [player.name for player in list(tournament.players.all())]
                response = JsonResponse({'status': 'success', 't_id': tournament.id, "players": players})
                return response
        else:
            logger.info(f"Form errors: {Tform.errors}")
            logger.info(f"Form errors: {formset.errors}")
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                response = JsonResponse({'status': 'failure', 't_id': 0})
                return response
    else:
        formset = PlayerFormSet(queryset=Player.objects.none())
        form = newTournamentForm()
    return render(request, "pong/pong.html", {'form': Tform, 'formset': formset})

def nextPool(request, t_id):
    logger.info(f"________Next pool t_id: {t_id}__________")
    tournament = get_object_or_404(Tournament, pk=t_id)
    tournament.make_games()
    if request.user.is_authenticated:
        logger.info(f"________USER LOGED IN: {request.user.username}__________")
        user = request.user
        game = tournament.games.filter((Q(player1__name=user.username) | Q(player2__name=user.username)) & Q(is_played=False)).first()
        if game:
            user.match_history.add(game)
    games = tournament.JSONgames()
    return JsonResponse({
        'tournament_id': tournament.id,
        'games': games
    })

def game_winner(request, game_ws_id):
    game = get_object_or_404(Game, game_ws_id=game_ws_id)
    if not game.is_played:
        logger.warning(f"Game {game_ws_id} is not yet played.")
        return JsonResponse({'error': 'Game has not been played yet.'}, status=400)

    winner = game.winner
    if winner:
        logger.info(f"The winner for game {game_ws_id} is {winner.name}")
        return JsonResponse({'winner': winner.name})
    else:
        logger.warning(f"No winner found for game {game_ws_id}.")
        return JsonResponse({'error': 'No winner found for this game.'}, status=404)
    
def get_old_tournament(request, t_id):
    tournament = get_object_or_404(Tournament, pk=t_id)
    old = tournament.ressend_tournament()
    return JsonResponse({
        'tournament_id': tournament.id,
        'pools': old,
    })