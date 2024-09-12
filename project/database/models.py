from django.db import models
from database.logger import logger
import random, string

class Player(models.Model):
    name = models.CharField(max_length=20, unique=True)
    psw = models.CharField(max_length=100)
    matches_won = models.IntegerField(default=0)

    def __str__(self):
        return self.name

    def increment_wins(self):
        """Increment the number of matches won by the player."""
        self.matches_won = models.F('matches_won') + 1
        self.save()

class Game(models.Model):
    player1 = models.ForeignKey(Player, related_name='games_as_player1', on_delete=models.CASCADE)
    player2 = models.ForeignKey(Player, related_name='games_as_player2', on_delete=models.CASCADE)
    points1 = models.IntegerField(default=0)
    points2 = models.IntegerField(default=0)
    game_ws_id = models.CharField(max_length=8, default=0)
    is_played = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.player1} vs {self.player2}"

    @property
    def winner(self):
        return self.player1 if self.points1 > self.points2 else self.player2

    @property
    def loser(self):
        return self.player1 if self.points1 < self.points2 else self.player2

    def finalize_game(self):
        self.is_played = True
        self.winner.increment_wins()
        self.save()

class Pool(models.Model):
    games = models.ManyToManyField(Game)
    round_number = models.IntegerField(default=1)  # Indicates which round this pool is for

    def __str__(self):
        return f"Round {self.round_number}"

class Tournament(models.Model):
    name = models.CharField(max_length=100, default="Tournament")
    players = models.ManyToManyField(Player, blank=True)
    pools = models.ManyToManyField(Pool, blank=True)
    winner = models.ForeignKey(Player, null=True, blank=True, on_delete=models.SET_NULL, related_name="won_tournaments")

    def __str__(self):
        return self.name

    def add_player(self, player):
        self.players.add(player)

    def make_games(self):
        if not self.pools.exists():
            # First round: pair all players randomly
            players = list(self.players.all())
        else:
            # Get winners from the last round
            last_pool = self.pools.order_by('-round_number').first()
            players = [game.winner for game in last_pool.games.filter(is_played=True)]

        if len(players) < 2:
            logger.warning("Not enough players to create games.")
            return

        random.shuffle(players)
        pool = Pool.objects.create(round_number=self.pools.count() + 1)
        
        while len(players) >= 2:
            player1 = players.pop()
            player2 = players.pop()
            game = Game.objects.create(
                player1=player1,
                player2=player2,
                game_ws_id=generate_unique_id()
            )
            pool.games.add(game)

        self.pools.add(pool)
        pool.save()
        self.save()

    def get_unplayed_games(self):
        last_pool = self.pools.order_by('-round_number').first()
        if last_pool:
            return last_pool.games.filter(is_played=False)
        return None

    def finalize_tournament(self):
        unplayed_games = self.get_unplayed_games()
        if unplayed_games and len(unplayed_games) == 0 and self.pools.count() > 1:
            last_pool = self.pools.order_by('-round_number').first()
            final_game = last_pool.games.filter(is_played=True).last()
            if final_game:
                self.winner = final_game.winner
                self.save()

def generate_unique_id():
    """Generate a unique WebSocket ID for games."""
    while True:
        unique_id = ''.join(random.choices(string.ascii_letters + string.digits, k=8))
        if not Game.objects.filter(game_ws_id=unique_id).exists():
            return unique_id
