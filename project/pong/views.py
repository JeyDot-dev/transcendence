from django.shortcuts import render
import json
import json
from database.forms import *
from database.models import *
from django.http import JsonResponse
import logging

logger = logging.getLogger(__name__)
# Create your views here.


def index(request):
	return render(request, 'index.html')

# Game manager:

from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response

from rest_framework.authtoken.models import Token
from django.shortcuts import get_object_or_404

from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

from .models import TournamentDB

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def create_tournament(request):
	print("create_tournament")
	print(request.data)
	tournament = TournamentDB()

	tournament.name = request.data.get('name')
	tournament.nb_player_per_team = request.data.get('nb_player_per_team')
	tournament.nb_players = request.data.get('nb_players')
	tournament.games_id = []
	tournament.players_username = []
	tournament.winners = []

	tournament.save()
	return Response({'message': 'Tournament created', 'tournament_id': 0}, status=status.HTTP_201_CREATED)


def index(request):
    formset = PlayerFormSet(queryset=Player.objects.none())
    form = newTournamentForm()
    logger.info(
        f"___Did not enter post request____"
    )
    return render(request, "pong/pong.html", {'form': form, 'formset': formset})

def newTournament(request):
    if request.method == 'POST':
        form = newTournamentForm(request.POST)
        formset = PlayerFormSet(request.POST)
        if form.is_valid() and formset.is_valid():
            tournament = Tournament(name=form.cleaned_data['tournament_title'])
            tournament.save()
            for form in formset:
                player = form.save()
                tournament.players.add(player)
            tournament.save()
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return JsonResponse({'status': 'success', 't_id': tournament.id, 'player': player.name})


def pong2d(request):
    return render(request, "pong/pong2d.html")

def launchTournamentLocalGame(request):
    data = {
          "p1": json.dumps({"name":"PlayerUno"}),
          "p2": json.dumps({"name":"PlayerDos"}),
	}
    return render(request, "pong/localTournamentGame.html", data)
