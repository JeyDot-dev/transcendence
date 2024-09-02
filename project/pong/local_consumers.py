import json
import asyncio
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .game_objects import Ball, Game, Player

local_games = {}
logger = logging.getLogger(__name__)

class LocalPongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        self.group_name = f'game_{self.game_id}'

        # Joindre le groupe correspondant au game_id
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        if self.game_id not in local_games:
            logger.info(f"Creating a new game instance for game {self.game_id}")
            self.game = Game(self.game_id, [], 2, 1280, 720, self.notifyEvent)
            player1 = Player(id=0, skin='skin1')
            player2 = Player(id=1, skin='skin2')
            self.game.addPlayer(player1, 0)  # Joueur 1 (gauche)
            self.game.addPlayer(player2, 1)  # Joueur 2 (droite)
            local_games[self.game_id] = self.game
        else:
            logger.info(f"Connecting to an existing game instance for game {self.game_id}")
            self.game = local_games[self.game_id]

        await self.accept()

        # Envoyer l'état initial ou mis à jour du jeu
        await self.send(text_data=json.dumps({
            'type': 'init',
            'game': await build_game_state(self.game)
        }))

        # Démarrer les boucles de jeu si elles ne sont pas déjà en cours
        if not hasattr(self, 'physics_task') or self.physics_task.done():
            logger.info(f"Starting the game loops for game {self.game_id}")
            self.physics_task = asyncio.create_task(self.game.physics_loop())
        
        self.game.running = True

    async def notifyEvent(self, eventData):
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'gameEvent',
                'event': eventData
            }
        )

    async def gameEvent(self, event):
        # Envoyer l'événement reçu à ce client spécifique
        await self.send(text_data=json.dumps(event['event']))

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)

        if text_data_json['key'] in ["w", "s"]:
            who = 0  # Joueur 1 (gauche)
        elif text_data_json['key'] in ["arrowup", "arrowdown"]:
            who = 1  # Joueur 2 (droite)
        else:
            return

        if text_data_json['type'] == "keydown" or text_data_json['type'] == "keyup":
            await handle_key(self.game, text_data_json['type'], text_data_json['key'], who)

    async def game_update(self):
        while self.game.running:
            await asyncio.sleep(1/60)  # 60 FPS
            await self.send(text_data=json.dumps(await update_game_state(self.game)))

    async def disconnect(self, close_code):
        logger.info(f"Client disconnected from game {self.game_id}")

        # Retirer le client du groupe
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        # Attendre un délai pour permettre aux clients de se reconnecter
        await asyncio.sleep(10)  # Attendre 10 secondes

        # Vérifier si le groupe est vide après le délai
        channel_layer = get_channel_layer()
        group_channels = await channel_layer.group_channels(self.group_name)

        if not group_channels:
            logger.info(f"No more connections for game {self.game_id}. Cleaning up.")
            local_games.pop(self.game_id, None)

async def handle_key(game, types, key, who):
    # logger.debug(f"Input received - Game: {game}, Type: {types}, Key: {key}, Who: {who}")
    if types != "keydown" and types != "keyup":
        return

    if key == "w":
        key = "up"
    elif key == "s":
        key = "down"
    elif key == "arrowup":
        key = "up"
    elif key == "arrowdown":
        key = "down"

    game.paddles[who].keys[key] = 1 if types == "keydown" else 0
    # logger.debug(f"Paddle update - Player: {who}, Key: {key}, Type: {types}, New State: {game.paddles[who].keys[key]}")
    # logger.debug(f"New Paddle0 Position: x={game.paddles[0].x} y={game.paddles[0].y}")
    # logger.debug(f"New Paddle1 Position: x={game.paddles[1].x} y={game.paddles[1].y}")

async def build_game_state(game):
    return {
        'type': 'initGame',
        'game_id': game.id,
        'players': [
            {
                'id': paddle.user_id,
                'position': paddle.get_position(),
                'color': paddle.color,
                'side': paddle.side,
                'width': paddle.width,
                'height': paddle.height
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

async def update_game_state(game):
    return {
        'type': 'update',
        'game_id': game.id,
        'players': [
            {
                'id': paddle.user_id,
                'position': paddle.get_position(),
                'color': paddle.color,
                'side': paddle.side,
                'width': paddle.width,
                'height': paddle.height
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