from django.db import models
from userManager.models import UserInfos
import random, string
import math
from datetime import datetime

class Player(models.Model):
    name = models.CharField(max_length=20)
    psw = models.CharField(max_length=100)
    matchesWon = models.IntegerField(default=0)
    is_winner = models.BooleanField(default=True) #used for tournaments
    user = models.ForeignKey(UserInfos, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

    def increment_wins(self):
        """Increment the number of matches won by the player."""
        self.matches_won = models.F('matches_won') + 1
        self.save()


class Tournament(models.Model):
    name = models.CharField(max_length=100, default = "Tournament")
    players = models.ManyToManyField(Player, blank=True)
    winner = models.IntegerField(default=1)
    round_number = models.IntegerField(default=1)
    timer = models.IntegerField(default=180)
    score = models.IntegerField(default=5)
    top_spin = models.BooleanField(default=False)
    back_spin = models.BooleanField(default=False)
    side_spin = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    def add_player(self, player):
        player.is_winner = True
        self.players.add(player)

    def make_games(self, user):
        winners = [player for player in list(self.players.all()) if player.is_winner]
        random.shuffle(winners)
        """if len(winners) == 3:
            self.games.create(player1=winners[0], player2=winners[1], game_ws_id=generate_unique_id(), pool=self.round_number)
            self.games.create(player1=winners[0], player2=winners[2], game_ws_id=generate_unique_id(), pool=self.round_number)
            self.games.create(player1=winners[2], player2=winners[1], game_ws_id=generate_unique_id(), pool=self.round_number)
        else:"""
        while len(winners) >= 2:
            game = self.games.create(player1=winners.pop(), player2=winners.pop(), game_ws_id=generate_unique_id(), pool=self.round_number, timer=self.timer, score=self.score, top_spin=self.top_spin, back_spin=self.back_spin, side_spin = self.side_spin)
        if user.is_authenticated:
            user.match_history.add(game)
        self.round_number = models.F('round_number') + 1
        self.save()

    def JSONgames(self):
        pairs = []
        for game in self.games.filter(is_played=False):
            pairs.append({
            'game_id': game.id,
            'game_ws_id': game.game_ws_id,
            'players': [game.player1.name, game.player2.name]
            })
        return pairs

    def oldPoolInfo(self, rn):
        pairs = []
        for game in self.games.filter(pool=rn):
            played = True if game.is_played else False 
            pairs.append({
                'game_id': game.id,
                'game_ws_id': game.game_ws_id,
                'players': [game.player1.name, game.player2.name],
                'winner' : game.winner,
                'is_played': played
            })
        return pairs

    def ressend_tournament(self):
        tournament = []
        for i in range(1, self.round + 1):
            tournament.append(self.oldPoolInfo(i))
        return tournament

class Game(models.Model):
    player1 = models.ForeignKey(Player, related_name='player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='player2', on_delete=models.CASCADE)
    points1 = models.IntegerField(default=0)
    points2 = models.IntegerField(default=0)
    game_ws_id = models.CharField(default=0)
    tournament = models.ForeignKey(Tournament, related_name='games', on_delete=models.CASCADE, blank=True, null=True)
    pool = models.IntegerField(default=1)
    is_played = models.BooleanField(default=False)
    date = models.DateTimeField(default=datetime.now, blank=True)
    timer = models.IntegerField(default=180)
    score = models.IntegerField(default=5)
    top_spin = models.BooleanField(default=False)
    back_spin = models.BooleanField(default=False)
    side_spin = models.BooleanField(default=False)

    def __str__(self):
        return self.player1.name + " VS " + self.player2.name 

    @property
    def winner(self):
        return self.player1 if self.points1 > self.points2 else self.player2

    @property
    def looser(self):
        return self.player1 if self.points1 < self.points2 else self.player2

    @property
    def players(self):
        return Player.objects.filter(models.Q(pk=self.player1.pk) | models.Q(pk=self.player2.pk))

    @property
    def next_game(self):
        self.is_played = True
        for game in self.tournament.games.all():
            if game.is_played is False:
                return game.id
        self.tournament.make_games()
        for game in self.tournament.games.all():
            if game.is_played is False:
                return game.id
        return self.id

    def finalize_game(self):
        self.is_played = True
        self.winner.increment_wins()
        self.looser.is_winner = False
        self.save()
        self.looser.save()

def generate_unique_id():
    """Generate a unique WebSocket ID for games."""
    while True:
        unique_id = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        if not Game.objects.filter(game_ws_id=unique_id).exists():
            return unique_id