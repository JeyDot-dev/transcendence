from django.contrib.auth.models import Group, User
from rest_framework import serializers

from .models import Game, Player

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['name']

class GameSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True)
    
    class Meta:
        model = Game
        fields = ['players']

    def create(self, data):
        players_data = data.pop('players')
        game = Game.objects.create(**data)
        for player_data in players_data:
            player, created = Player.objects.get_or_create(name=player_data['name'])
            game.players.add(player)
        return game
