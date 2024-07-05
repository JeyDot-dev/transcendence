import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
	async def connect(self):
		user = self.scope['user']
		if not user.is_authenticated:
			self.send(text_data=json.dumps({
				'type': 'error',
				'message': 'You must be logged in to chat'
			}))
			await self.close()
			return
		self.room_name = "chat_" + self.scope['url_route']['kwargs']['game_id']

		await self.channel_layer.group_add (
			self.room_name,
			self.channel_name
		)

		await self.accept()
	
	async def receive(self, text_data=None, bytes_data=None):
		text_data_json = json.loads(text_data)
		message = text_data_json['message']

		await self.channel_layer.group_send (
			self.room_name,
			{
				'type': 'chat_message',
				'message': await self.build_response(message)
			}
		)

	async def chat_message(self, event):
		message = event['message']

		await self.send(text_data=json.dumps({
			'type': 'chat_message',
			'message': message
		}))

	async def build_response(self, message):
		user = self.scope['user']
		return json.dumps({
			'username': user.username,
			'profile_pic': user.profile_pic,
			'message': message,
		})