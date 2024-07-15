from django.shortcuts import render

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