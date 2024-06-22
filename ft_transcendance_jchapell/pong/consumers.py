import json
import random
import string
import threading
from time import sleep
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from .game_objects import Ball, Paddle, Game

games = []

class PongConsumer(WebsocketConsumer):
	def connect(self):
		self.party = self.scope['url_route']['kwargs']['game_id']
		self.game = get_game(self.party)

		if self.game is None:
			self.game = Game(self.party, [Paddle(0, (255, 255, 255))], Ball(560, 360, (255, 255, 255)))
			games.append(self.game)
			threading.Thread(target=self.game.physics).start()
		else:
			self.game.players.append(Paddle(560, (255, 255, 255)))
		
		threading.Thread(target=self.game_update).start()

		async_to_sync(self.channel_layer.group_add)(
			self.party,
			self.channel_name
			)

		self.accept()
		
	def game_update(self):
		while True:
			async_to_sync(self.channel_layer.group_send)(
				self.party,
				build_response(self.game)
			)

	def game_state(self, event):
		self.send(text_data=json.dumps(event))

	def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)
		self.input_message(text_data_json)

	def input_message(self, event):
		handle_key(self.game, event)
		
	def disconnect(self, close_code):
		if len(self.game.players) == 0:
			games.remove(self.game)
		else:
			self.game.players.pop(-1)

		async_to_sync(self.channel_layer.group_discard)(
			self.party,
			self.channel_name
		)


def get_game(game_id):
	for game in games:
		if game.id == game_id:
			return game
	return None

# Awful but fonctionnal: TODO
def handle_key(game, movement):
	if movement["type"] == "player_keydown":
		if movement["message"] == "p1_up":
			game.players[0].keys["up"] = 1
		elif movement["message"] == "p1_down":
			game.players[0].keys["down"] = 1
		elif movement["message"] == "p2_up":
			game.players[1].keys["up"] = 1
		elif movement["message"] == "p2_down":
			game.players[1].keys["down"] = 1
	elif movement["type"] == "player_keyup":
		if movement["message"] == "p1_up":
			game.players[0].keys["up"] = 0
		elif movement["message"] == "p1_down":
			game.players[0].keys["down"] = 0
		elif movement["message"] == "p2_up":
			game.players[1].keys["up"] = 0
		elif movement["message"] == "p2_down":
			game.players[1].keys["down"] = 0

def generateId():
	res = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
	while res in games:
		res = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
	return res

def build_response(game):
	return {
		'type': 'game_state',
		'game': {
			'id': game.id,
			'players': [player.__dict__ for player in game.players],
			'ball': game.ball.__dict__,
			'score': game.score,
			'timer': game.timer
		}
	}