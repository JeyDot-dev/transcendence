from django.db import models
import random

# Create your models here.
class GameDB(models.Model):
	id = models.CharField(max_length=200, primary_key=True)
	players_username = models.JSONField()
	ball_color = models.CharField(max_length=7, default="#FFFFFF")
	left_score = models.IntegerField(default=0)
	right_score = models.IntegerField(default=0)
	started = models.BooleanField(default=False)
	finished = models.BooleanField(default=False)
	winners = models.JSONField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	nb_max_players = models.IntegerField(default=2)

	def __str__(self):
		return self.id
	
	def to_dict(self):
		return {
			'id': self.id,
			'players_username': self.players_username,
			'ball_color': self.ball_color,
			'left_score': self.left_score,
			'right_score': self.right_score,
			'started': self.started,
			'finished': self.finished,
			'winners': self.winners,
			'created_at': self.created_at,
			'updated_at': self.updated_at,
			'nb_max_players': self.nb_max_players
		}
	
	def add_player(self, username):
		self.players_username.append(username)
		self.save()
	
	def remove_player(self, username):
		self.players_username.remove(username)
		self.save()
	
	def start_game(self):
		self.started = True
		self.save()
	
	def end_game(self, winners: list[str]):
		self.finished = True
		self.winners = winners
		self.save()
	
	def set_ball_color(self, color: str):
		self.ball_color = color
		self.save()
	
	def set_score(self, left_score: int, right_score: int):
		self.left_score = left_score
		self.right_score = right_score
		self.save()
	
	def get_players(self):
		return self.players_username

class Tournament(models.Model):
	id = models.CharField(max_length=200, primary_key=True)
	nb_player_per_team = models.IntegerField(default=1)
	nb_players = models.IntegerField(default=4)
	finished = models.BooleanField(default=False)
	started = models.BooleanField(default=False)
	winner = models.JSONField()
	ready = models.BooleanField(default=False)
	games_id = models.JSONField()
	players_username = models.JSONField()

	def __str__(self):
		return self.id
	
	def to_dict(self):
		return {
			'id': self.id,
			'nb_player_per_team': self.nb_player_per_team,
			'nb_players': self.nb_players,
			'finished': self.finished,
			'started': self.started,
			'winner': self.winner,
			'ready': self.ready,
			'games_id': self.games_id,
			'players_username': self.players_username
		}
	
	def set_players_username(self, players: list[str]):
		self.players_username = players
		if len(players) == self.nb_players:
			self.ready = True
		self.save()

	def end(self, winner: list[str]):
		self.finished = True
		self.winner = winner
		self.save()
	
	def start(self):
		self.started = True
		self.save()



	
