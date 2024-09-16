from django.urls import re_path
from .consumers import PongConsumer
from .mm_consumers import MatchmakingConsumer

websocket_urlpatterns = [
    # re_path(r"ws/pong/(?P<game_id>[\w\-]+)/$", PongConsumer.as_asgi()),
    # re_path(r"ws/pong/local/(?P<game_id>[\w\-]+)/$", PongConsumer.as_asgi()),
    re_path(r"ws/pong/(?P<type>(local|remote))/(?P<game_id>[\w\-]+)/$", PongConsumer.as_asgi()),
    re_path(r"ws/pong/matchmaking/", MatchmakingConsumer.as_asgi()),
]
