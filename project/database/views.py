from django.shortcuts import render
from django.db.models import F, Q
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from django.template import loader
from database.models import generate_unique_id
import random, string
import logging
from django.http import HttpResponseNotFound

logger = logging.getLogger(__name__)

from .models import Game, Player, Tournament
from .forms import *

def tournamentWinner(request, t_id):
    tourny = get_object_or_404(Tournament, pk=t_id)
    tourny.winner = tourny.players.get(is_winner=True)


def newGame(request):
    if request.method == 'POST':
        # logger.info("_____POST METHODE________")
        form = newGameForm(request.POST)
        Sform = GameSettingsForm(request.POST)
        if form.is_valid() and Sform.is_valid():
            # logger.info("_____FORMS VALID________")
            player1_name = form.cleaned_data['player1_name']
            player2_name = form.cleaned_data['player2_name']
            player1, new1= Player.objects.get_or_create(name=player1_name)
            player2, new1 = Player.objects.get_or_create(name=player2_name)
            game_ws_id = generate_unique_id()
            player1.save()
            player2.save()
            game = Game.objects.create(player1=player1, player2=player2, game_ws_id=game_ws_id, timer=Sform.cleaned_data['timer'], score=Sform.cleaned_data['score'], top_spin=Sform.cleaned_data['top_spin'], back_spin=Sform.cleaned_data['back_spin'], side_spin=Sform.cleaned_data['side_spin'])
            if request.user.is_authenticated:
                    user = request.user
                    user.match_history.add(game)
            return JsonResponse({'status': 'success', 'game_ws_id': game.game_ws_id})
        elif request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # logger.info("_____UNKWON FORMS NOT VALID________ ")
            if not form.is_valid():
                # logger.info("_____FORMS NOT VALID________ {form.errors}")
                for field, message in form.errors.items():
                    if message:
                        return JsonResponse({'status': 'failure', 'reason': field + ": "+ message[0]})
            if not Sform.is_valid():
                # logger.info("_____SFORMS NOT VALID________ {form.errors}")
                for field, message in Sform.errors.items():
                    if message:
                        return JsonResponse({'status': 'failure', 'reason': field + ": "+ message[0]})
        # logger.info("request header wierd thing")
    raise Http404()
        
def newTournament(request):
    if request.method == "POST":
        Tform = newTournamentForm(request.POST)
        formset = PlayerFormSet(request.POST)
        Sform = GameSettingsForm(request.POST)
        if Tform.is_valid() and formset.is_valid() and Sform.is_valid():
            # logger.info(f"______Forms valid_______")
            tournament = Tournament(name=Tform.cleaned_data['tournament_title'], timer=Sform.cleaned_data['timer'], score=Sform.cleaned_data['score'], top_spin=Sform.cleaned_data['top_spin'], back_spin=Sform.cleaned_data['back_spin'], side_spin=Sform.cleaned_data['side_spin'])
            tournament.save()
            for form in formset:
                player_name = form.cleaned_data.get("name")
                if player_name:
                    player, created = Player.objects.get_or_create(name=player_name)
                    player.is_winner = True
                    player.save()
                    tournament.players.add(player)
            if tournament.players.count() < 2 and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                tournament.delete()
                response = JsonResponse({'status': 'failure', 'reason': "You need at least two players"})
                return response
            elif not tournament.players.count() in (4, 8, 16) and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                tournament.delete()
                response = JsonResponse({'status': 'failure', 'reason': "You must have 4, 8 or 16 players"})
                return response
            else:
                tournament.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                players = [player.name for player in list(tournament.players.all())]
                response = JsonResponse(
                    {"status": "success", "t_id": tournament.id, "players": players}
                )
                return response
        elif request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            # logger.info(f"Form errors: {Tform.errors}")
            # logger.info(f"Form errors: {formset.errors}")
            if not formset.is_valid():
                for form_errors in formset.errors:
                    if form_errors:
                        first_field = next(iter(form_errors))
                        error_message = form_errors[first_field]
                        break 
                response = JsonResponse({'status': 'failure', 'reason': error_message})
            elif not Tform.is_valid():
                response = JsonResponse({'status': 'failure', 'reason': "Tournament title is required"})
            elif not Sform.is_valid():
                for field, message in Sform.errors.items():
                    if message:
                        return JsonResponse({'status': 'failure', 'reason': field + ": " + message[0]})
            else:
                response = JsonResponse({'status': 'failure', 'reason': "unknown error"})
            return response
    else:
        raise Http404()

def nextPool(request, t_id):
    tournament = get_object_or_404(Tournament, pk=t_id)
    tournament.make_games(request.user)
    if request.user.is_authenticated:
        user = request.user
        game = tournament.games.filter(
            (Q(player1__name=user.username) | Q(player2__name=user.username))
            & Q(is_played=False)
        ).first()
        if game:
            user.match_history.add(game)
    games = tournament.JSONgames()
    return JsonResponse({"tournament_id": tournament.id, "games": games})


def game_winner(request, game_ws_id):
    game = get_object_or_404(Game, game_ws_id=game_ws_id)
    if not game.is_played:
        # logger.warning(f"Game {game_ws_id} is not yet played.")
        return JsonResponse({"error": "Game has not been played yet."}, status=400)

    winner = game.winner
    if winner:
        # logger.info(f"The winner for game {game_ws_id} is {winner.name}")
        return JsonResponse({"winner": winner.name})
    else:
        # logger.warning(f"No winner found for game {game_ws_id}.")
        return JsonResponse({"error": "No winner found for this game."}, status=404)


def get_old_tournament(request, t_id):
    tournament = get_object_or_404(Tournament, pk=t_id)
    old = tournament.ressend_tournament()
    return JsonResponse({
        'tournament_id': tournament.id,
        'pools': old,
    })
