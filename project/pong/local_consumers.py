import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_objects import Ball, Game, Player

local_games = {}

class LocalPongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.game_id = self.scope['url_route']['kwargs']['game_id']

        if self.game_id not in local_games:
            self.game = Game(self.game_id, [], Ball(640, 360, (255, 255, 255)))
            player1 = Player(id=0, skin='skin1')
            player2 = Player(id=1, skin='skin2')
            self.game.add_player(player1, 0)  # Joueur 1 (gauche)
            self.game.add_player(player2, 1)  # Joueur 2 (droite)
            local_games[self.game_id] = self.game
        else:
            self.game = local_games[self.game_id]

        await self.send(text_data=json.dumps({
            'type': 'init',
            'game': await build_game_state(self.game)
        }))

        asyncio.create_task(self.game.physics())
        asyncio.create_task(self.game_update())

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)

        if text_data_json['key'] in ["w", "s"]:
            who = 0  # Joueur 1 (gauche)
        elif text_data_json['key'] in ["up", "down"]:
            who = 1  # Joueur 2 (droite)
        else:
            return

        if text_data_json['type'] == "keydown" or text_data_json['type'] == "keyup":
            await handle_key(self.game, text_data_json['type'], text_data_json['key'], who)

    async def game_update(self):
        while True:
            await asyncio.sleep(1 / 60)  # 60 FPS
            await self.send(text_data=json.dumps(await build_game_state(self.game)))

    async def disconnect(self, close_code):
        if self.game_id in local_games:
            del local_games[self.game_id]

async def handle_key(game, types, key, who=0):
    if types != "keydown" and types != "keyup":
        return

    if key == "w":
        key = "up"
    elif key == "s":
        key = "down"
    elif key == "up":
        key = "up"
    elif key == "down":
        key = "down"

    game.paddles[who].keys[key] = 1 if types == "keydown" else 0

async def build_game_state(game):
    return {
        'game_id': game.id,
        'players': [
            {
                'id': paddle.user_id,
                'position': paddle.get_position(),
                'color': paddle.color,
                'side': paddle.side,
                'width': paddle.width
            } for paddle in game.paddles
        ],
        'ball': {
            'x': game.ball.x,
            'y': game.ball.y,
            'color': game.ball.color,
            'speed': game.ball.speed,
            'size': game.ball.size
        },
        'score': game.score
    }
