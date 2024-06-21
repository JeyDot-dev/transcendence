import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from .game_objects import Ball, Paddle, Game

class PongConsumer(WebsocketConsumer):
	def connect(self):
		self.party = self.scope['url_route']['kwargs']['game_id']

		async_to_sync(self.channel_layer.group_add)(
			self.party,
			self.channel_name
		)

		self.accept()
		
	def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)

		async_to_sync(self.channel_layer.group_send)(
			self.party,
			{
				'type': 'input_message',
				'event': text_data_json
			}
		)

	def input_message(self, event):
		print(event)

	def disconnect(self, close_code):
		pass


def generateId():
	import random
	import string

	return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))