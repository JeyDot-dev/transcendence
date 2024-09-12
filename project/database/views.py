from django.shortcuts import render
from django.db.models import F
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

def winner(request, gameScore, game_id):
    game = get_object_or_404(Game, pk=game_id)
    game.points1 = gameScore[0]
    game.points2 = gameScore[1]
    game.is_played = True
    game.save()
    game.winner.is_winner = True
    game.looser.is_winner = False
    game.winner.save()
    game.looser.save()
    game.winner.matchesWon = F("matchesWon") + 1
    response = render(request, 'database/winner.html', {'game': game})
    game.winner.save()
    game.looser.save()
    if game.tournament:
        if game.next_game == game.id:
            return redirect('tournamentWinner', t_id = game.tournament.id)
    return response

def tournamentWinner(request, t_id):
    tourny = get_object_or_404(Tournament, pk=t_id)
    tourny.winner = tourny.players.get(is_winner=True)
    return render(request, 'database/Tournamentwinner.html', {'tournament': tourny})


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


def addPlayers(request, t_id):
    form = addPlayer(request.POST)
    if form.is_valid():
        tournament = get_object_or_404(Tournament, pk=t_id)
        player_name = form.cleaned_data['player_name']
        player, new = Player.objects.get_or_create(name=player_name)
        player.is_winner = True
        player.save()
        tournament.add_player(player)
        tournament.save()
        return redirect("addPlayers", t_id = tournament.id)
    tournament = get_object_or_404(Tournament, pk=t_id)
    return render(request, 'database/addplayers.html', {'form': form, 'tournament': tournament})

def newTournament(request):
    if request.method == 'POST':
        Tform = newTournamentForm(request.POST)
        formset = PlayerFormSet(request.POST)
        if Tform.is_valid() and formset.is_valid():
            logger.info(f"______Forms valid_______")
            tournament = Tournament(name=Tform.cleaned_data['tournament_title'])
            tournament.save()
            for form in formset:
                player_name = form.cleaned_data['name']
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
    games = tournament.JSONgames()
    return JsonResponse({
        'tournament_id': tournament.id,
        'games': games
    })

def game_winner(request, game_ws_id):
    logger.warning(f"Looking for Game {game_ws_id}")
    game = get_object_or_404(Game, game_ws_id=game_ws_id)
    logger.warning(f"Found Game {game_ws_id}")
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