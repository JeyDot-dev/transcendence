from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.asgi import get_asgi_application
from django.urls import resolve, reverse
from asgiref.sync import sync_to_async
from django.http import HttpRequest
import json

class SinglepageConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Accept the connection
        await self.accept()

    async def disconnect(self, close_code):
        # Handle disconnection
        pass

    async def receive_json(self, data):
        # Parse the text_data to get the view name
        view_name = data['view']

        # Create a fake request to render the view
        request = HttpRequest()
        request.method = 'GET'
        request.path = '/' + view_name

        try:
            # Resolve the URL to find the corresponding view
            view_func, args, kwargs = resolve(request.path)
        except Resolver404:
            # Handle the case where no template could be found
            await self.send(text_data=json.dumps({"error": "No template found for given view"}))
            return

        # Check if the resolved view is the default view
        default_view_func, _, _ = resolve(reverse('default_view'))
        if view_func == default_view_func:
            # If it is, send an error message instead of the default view
            await self.send(text_data=json.dumps({"error": "No template found for given view"}))
            return

        # Call the view function and get the response
        response = await sync_to_async(view_func)(request, *args, **kwargs)

        await self.send(text_data=response.content.decode())
