import json
import random
import string
import threading
import asyncio
from time import sleep
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import async_to_sync
from .game_objects import Ball, Paddle, Game
from userManager.models import UserInfos

games = []

class PongConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		await self.accept()
		self.user = self.scope['user']
		self.party = "pong_" + self.scope['url_route']['kwargs']['game_id']
		self.game = get_game(self.party)

		await self.channel_layer.group_add (
			self.party,
			self.channel_name
			)

		if self.game == None:
			self.game = Game(self.party, [self.user.to_dict()], Ball(640, 360, (255, 255, 255)))
			self.game.add_player(self.user, 0)
			games.append(self.game)

			#asyncio.create_task(self.game.physics())
			#asyncio.create_task(game_update(self))
			print("Game created")
		else:
			try: 
				await new_player(self, self.user)
			except Exception as e:
				print(f'Error: {e}')
				await self.send(text_data=json.dumps({
					'type': 'error',
					'message': 'Game is full'
				}))
				await self.close()
				return
		
		await self.send(text_data=json.dumps({
			'type': 'init',
			'game': await build_game_init(self.game)
		}))

	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)

		who = next((i for i, paddle in enumerate(self.game.paddles) if paddle.user_id == text_data_json["player_id"]), None) #Il trouve le paddle correspondant à l'id du joueur
		if who == None: return

		if text_data_json['type'] == "keydown" or text_data_json['type'] == "keyup":
			print("Key event")
			await handle_key(self.game, text_data_json['type'], text_data_json['key'], who)
	
	async def new_player(self, event):
		await self.send(text_data=json.dumps(event))
		print("new_player")
		print("Game player count:" + str(len(self.game.players)))


	async def game_state(self, event):
		await self.send(text_data=json.dumps(event))

	async def player_left(self, event):
		await self.send(text_data=json.dumps(event))
		
	async def disconnect(self, close_code):
		for player in self.game.players:
			if player is not UserInfos: continue
			if player.id == self.user.id:
				self.game.players.remove(player)
				break
		for paddles in self.game.paddles:
			if paddles is not Paddle: continue
			if paddles.player.id == self.player.id:
				self.game.paddles.remove(paddles)
				break
		
		print("Game player count:" + str(len(self.game.players)))

		if len(self.game.players) == 0:
			games.remove(self.game)
			await self.channel_layer.group_discard (
				self.party,
				self.channel_name
			)
		else:
			await self.channel_layer.group_send (
				self.party,
				{
					'type': 'player_left',
					'message': 'A player has left the game!',
					'who': self.user.id
				}
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

async def build_game_state(game):
	return {
		'type': 'game_state',
		'game': {
			'id': game.id,
			'paddles': [paddle.__dict__ for paddle in game.paddles],
			'ball': game.ball.__dict__,
			'score': game.score,
			'timer': game.timer
		}
	}

async def build_game_init(game):
	return {
		'id': game.id,
		'paddles': [paddle.__dict__ for paddle in game.paddles],
		'ball': game.ball.__dict__,
		'score': game.score
	}

async def new_player(game, who):
	game.game.add_player(who, 0 if len(game.game.players) == 0 else 1)

	await game.channel_layer.group_send (
		game.party,
		{
			'type': 'new_player',
			'message': 'A new player has joined the game!',
			'name': who.username,
			'new_paddle': game.game.paddles[-1].__dict__,
		}
	)

async def game_update(consumer):
	while True:
		await asyncio.sleep(60 / 1000)
		await consumer.channel_layer.group_send (
			consumer.party,
			await build_game_state(consumer.game)
		)