import json
import random
import string
import threading
import asyncio
from time import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from .game_objects import Ball, Paddle, Game

games = []

class PongConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		self.party = self.scope['url_route']['kwargs']['game_id']
		self.game = get_game(self.party)

		# if self.game is None: 
		self.game = Game(self.party, [Paddle(0, (255, 255, 255))], Ball(560, 360, (255, 255, 255)))
		games.append(self.game)
		asyncio.create_task(self.game.physics())
		# else:
		# 	await self.game.players.append(Paddle(560, (255, 255, 255)))
		
		await self.channel_layer.group_add (
			self.party,
			self.channel_name
			)

		asyncio.create_task(self.game_update())

		
	async def game_update(self):
		while True:
			print("game_update")
			sleep(0.01)
			await self.channel_layer.group_send (
				self.party,
				await build_response(self.game)
			)

	async def game_state(self, event):
		await self.send(text_data=json.dumps(event))

	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)
		await self.input_message(text_data_json)

	async def input_message(self, event):
		await handle_key(self.game, event)
		
	async def disconnect(self, close_code):
		if len(self.game.players) == 0:
			games.remove(self.game)
		else:
			self.game.players.pop(-1)

		await self.channel_layer.group_discard (
			self.party,
			self.channel_name
		)


async def get_game(game_id):
	for game in games:
		if game.id == game_id:
			return game
	return None

# Awful but fonctionnal: TODO
async def handle_key(game, movement):
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

async def build_response(game):
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