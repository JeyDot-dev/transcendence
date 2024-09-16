from django.urls import re_path

from .local_consumers import LocalPongConsumer

websocket_urlpatterns = [
    re_path(r"ws/pong/local/(?P<game_id>[\w\-]+)/$", LocalPongConsumer.as_asgi()),
]
