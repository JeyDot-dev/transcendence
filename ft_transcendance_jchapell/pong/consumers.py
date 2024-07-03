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
		self.game = await get_game(self.party)

		# if self.game == None: 
		# 	self.game = Game(self.party, [Paddle(0, (255, 255, 255))], Ball(560, 360, (255, 255, 255)))
		# 	games.append(self.game)
		# 	asyncio.create_task(self.game.physics())
		# else:
		# 	await self.game.players.append(Paddle(560, (255, 255, 255)))
		
		await self.channel_layer.group_add (
			self.party,
			self.channel_name
			)

		# asyncio.create_task(self.game_update())

	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)

		print(text_data_json['type'])

		if text_data_json['type'] == "keydown" or text_data_json['type'] == "keyup":
			print("key")
			await handle_key(self.game, text_data_json['type'], text_data_json['key'], text_data_json["player_id"]) # replace 0 by the index of the player

		# await self.input_message(text_data_json)

	# async def game_update(self):
	# 	while True:
	# 		print("game_update")
	# 		sleep(0.01)
	# 		await self.channel_layer.group_send (
	# 			self.party,
	# 			await build_response(self.game)
	# 		)

	# async def game_state(self, event):
	# 	await self.send(text_data=json.dumps(event))


	# async def input_message(self, event):
	# 	await handle_key(self.game, event)
		
	# async def disconnect(self, close_code):
	# 	if len(self.game.players) == 0:
	# 		games.remove(self.game)
	# 	else:
	# 		self.game.players.pop(-1)

	# 	await self.channel_layer.group_discard (
	# 		self.party,
	# 		self.channel_name
	# 	)


async def get_game(game_id):
	for game in games:
		if game.id == game_id:
			return game
	return None

async def handle_key(game, type, key, who=0):
	if key != "keydown" or key != "keyup":
		return
	game.players[who].keys[message] = 1 if type == "keydown" else 0
	print(game.players[who].keys)

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