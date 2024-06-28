import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		self.room_name = self.scope['url_route']['kwargs']['game_id']

		await self.channel_layer.group_add (
			self.room_name,
			self.channel_name
		)

		await self.accept()
	
	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)
		message = text_data_json['message']

		print(text_data_json)

		await self.channel_layer.group_send (
			self.room_name,
			{
				'type': 'chat_message',
				'message': message
			}
		)

	async def chat_message(self, event):
		message = event['message']

		await self.send(text_data=json.dumps({
			'type': 'chat_message',
			'message': message
		}))
