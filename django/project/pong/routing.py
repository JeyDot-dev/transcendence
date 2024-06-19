from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.urls import path
from pong.consumers import PongConsumer

websocket_urlpatterns = [
    path('ws/pong/<uuid:game_id>/', PongConsumer.as_asgi()),  # Utilisez <uuid:game_id> pour capturer l'UUID dans l'URL
]

application = ProtocolTypeRouter({
    'websocket': AuthMiddlewareStack(
        URLRouter(
            websocket_urlpatterns
        )
    ),
})
