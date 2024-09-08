from django.db import models
import random

# Create your models here.

class Player(models.Model):
    name = models.CharField(max_length=20)
#if psw set, username is reserved. Change to int and hashed pwd check for security later
    psw = models.CharField(max_length=100)
    matchesWon = models.IntegerField(default=0)
    is_winner = models.BooleanField(default=True) #used for tournaments

    def __str__(self):
        return self.name


class Tournament(models.Model):
    name = models.CharField(max_length=100, default = "Tournament")
    players = models.ManyToManyField(Player, blank=True)
    winner = models.IntegerField(default=1)

    def __str__(self):
        return self.name
    
    def add_player(self, player):
        self.players.add(player)

    def make_games(self):
        #after start, make pairs, cannot add more players
        winners = [player for player in list(self.players.all()) if player.is_winner]
        print("Winners:", winners)
        random.shuffle(winners)
        #since is_winner doesn't change if you don't play, the player left out will automaticly rise
        while len(winners) >= 2:
            self.games.create(player1=winners.pop(), player2=winners.pop())


class Game(models.Model):
    player1 = models.ForeignKey(Player, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='games_as_player2', on_delete=models.CASCADE)
    points1 = models.IntegerField(default=0)
    points2 = models.IntegerField(default=0)
    tournament = models.ForeignKey(Tournament, related_name='games', on_delete=models.CASCADE, blank=True, null=True)
    is_played = models.BooleanField(default=False)

    def __str__(self):
        return self.player1.name + " VS " + self.player2.name 
    
    @property
    def winner(self): #if winner.is_winner is false, the match has not been played
        #ex-aequo are impossible
        return self.player1 if self.points1 > self.points2 else self.player2
    
    @property
    def looser(self):
        #ex-aequo are impossible
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


    


        
