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
		self.party = "pong_" + self.scope['url_route']['kwargs']['game_id']
		self.game = get_game(self.party)

		await self.channel_layer.group_add (
			self.party,
			self.channel_name
			)

		if self.game == None:
			self.game = Game(self.party, [Paddle(0, (255, 255, 255))], Ball(560, 360, (255, 255, 255)))
			games.append(self.game)
			await self.send(text_data=json.dumps({
				'type': 'init',
				'message': {
					'id': 0
				}
			}))
			asyncio.create_task(self.game.physics())
			asyncio.create_task(game_update(self))
		else:
			await new_player(self)
			await self.send(text_data=json.dumps({
				'type': 'init',
				'message': {
					'id': self.game.players.index(self.game.players[-1])
				}
			}))

	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)

		if text_data_json['type'] == "keydown" or text_data_json['type'] == "keyup":
			await handle_key(self.game, text_data_json['type'], text_data_json['key'], text_data_json["player_id"])

		# await self.input_message(text_data_json)
	
	async def new_player(self, event):
		await self.send(text_data=json.dumps(event))
		print("new_player")
		print("Game player count:" + str(len(self.game.players)))


	async def game_state(self, event):
		await self.send(text_data=json.dumps(event))


	# async def input_message(self, event):
	# 	await handle_key(self.game, event)
		
	async def disconnect(self, close_code):
		self.game.players.pop(-1)
		print("Game player count:" + str(len(self.game.players)))

		if len(self.game.players) == 0:
			games.remove(self.game)
			await self.channel_layer.group_discard (
				self.party,
				self.channel_name
			)

def get_game(game_id):
	for game in games:
		if game.id == game_id:
			return game
	return None

async def handle_key(game, types, key, who=0):
	if types != "keydown" and types != "keyup":
		return
	game.players[who].keys[key] = 1 if types == "keydown" else 0
	print(str(who) + " -> " + str(key) + ": " + str(1 if types == "keydown" else 0))

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

async def new_player(game):
	new_x_pos = len(game.game.players) * (1280 - game.game.players[0].width)
	game.game.players.append(Paddle(new_x_pos, (255, 255, 255)))
	await game.channel_layer.group_send (
		game.party,
		{
			'type': 'new_player',
			'message': 'A new player has joined the game!'
		}
	)

async def game_update(consumer):
	while True:
		await asyncio.sleep(60 / 1000)
		await consumer.channel_layer.group_send (
			consumer.party,
			await build_response(consumer.game)
		)