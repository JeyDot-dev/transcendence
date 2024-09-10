from django.shortcuts import render
from django.db.models import F
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse, Http404
from django.shortcuts import get_object_or_404, render, redirect
from django.urls import reverse
from django.template import loader
import random, string


from .models import Game, Player, Tournament
from .forms import *
# Create your views here.

def play(request, game_id):
    game = get_object_or_404(Game, pk=game_id)
    if request.method == 'POST':
        player_id = int(request.POST.get('player'))
        if player_id == game.player1.id:
            game.points1 = F("points1") + 1
        else:
            game.points2 = F("points2") + 1
        game.save()
        game.refresh_from_db()
        if game.points1 >= 5 or game.points2 >= 5 :
            return redirect('winner', game_id=game.id)
        return redirect('play', game_id=game.id)
    return render(request, 'database/play.html', {'game': game})

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
    """serializer = GameSerializer(data=request.POST)
    if serializer.is_valid():
        game = serializer.save()
        return redirect("play", game_id = game.id)
    return render(request, 'database/newgame.html')"""
    """form = newGameForm(request.POST)
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
    return render(request, 'database/newgame.html', {'form': form})"""
    if request.method == 'POST':
        formset = PlayerFormSet(request.POST, queryset=Player.objects.none())
        if formset.is_valid():
            game = Game.objects.create()
            for form in formset:
                player = form.save()
                game.players.add(player)
            return redirect("play", game_id=game.id)
    else:
        formset = PlayerFormSet(queryset=Player.objects.none())
    
    return render(request, 'database/newgame.html', {'formset': formset})


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
        form = newTournamentForm(request.POST)
        formset = PlayerFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            tournament = Tournament(name=form.cleaned_data['tournament_title'])
            tournament.save()
            for form in formset:
                """
                player_name = form.cleaned_data['name']
                player, created = Player.objects.get_or_create(name=player_name)
                if created:
                    player.save()
                """
                player = form.save()
                tournament.players.add(player)
            tournament.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                response = JsonResponse({'status': 'success', 't_id': tournament.id})
                return response
    else:
        formset = PlayerFormSet(queryset=Player.objects.none())
        form = newTournamentForm()
    return render(request, "pong/pong.html", {'form': form, 'formset': formset})

def NextPool(request, t_id):
    tournament = get_object_or_404(Tournament, pk=t_id)
    tournament.make_games()
    games = tournament.JSONgames()
    return JsonResponse({
        'tournament_id': tournament.id,
        'games': games
    })