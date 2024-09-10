import json
import asyncio
from pong.logger import logger
from django.shortcuts import get_object_or_404
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
from asgiref.sync import sync_to_async
from database.models import Game as GameDB, Player as PlayerDB
from .game_objects import Game, Player

games_pool = {}
# logger = logging.getLogger(__name__)


class LocalPongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        from .game_objects import Game, Player

        self.game_id = self.scope["url_route"]["kwargs"]["game_id"]
        self.group_name = f"game_{self.game_id}"

        # Joindre le groupe correspondant au game_id
        await self.channel_layer.group_add(self.group_name, self.channel_name)

        # Vérifier si le jeu est déjà en mémoire
        if self.game_id in games_pool:
            logger.info(f"Connecting to an existing game instance for game {self.game_id}")
            games_pool[self.game_id]["connections"] += 1
            self.game = games_pool[self.game_id]["game"]
            self.log_game_state("Existing Game param")
        else:
            # Essayer de récupérer la game depuis la base de données
            GameDB = await sync_to_async(self.get_game_from_db)(self.game_id)

            if GameDB is not None:
                logger.info(f"Game found in the database for game {self.game_id}")
                # Récupérer les joueurs depuis la base de données
                player1 = await sync_to_async(lambda: GameDB.player1)()
                player2 = await sync_to_async(lambda: GameDB.player2)()

                # Créer une nouvelle instance de game avec les joueurs de la base de données
                self.game = Game(self.game_id, [], 2, 1280, 720, self.notifyEvent, 'dbGame')
                self.game.addPlayer(Player(id=player1.id, skin="skin1", name=player1.name), 0)
                self.game.addPlayer(Player(id=player2.id, skin="skin2", name=player2.name), 1)
            else:
                logger.info(f"No game in the database, creating a new local game instance for game {self.game_id}")
                # Créer un jeu local si aucun jeu DB n'existe
                self.game = Game(self.game_id, [], 2, 1280, 720, self.notifyEvent, 'localGame')
                player1 = Player(id=0, skin="skin1", name='Player1')
                player2 = Player(id=1, skin="skin2", name='Player2')
                self.game.addPlayer(player1, 0)  # Joueur 1 (gauche)
                self.game.addPlayer(player2, 1)  # Joueur 2 (droite)

            # Démarrer la physique
            self.physics_task = asyncio.create_task(self.game.physics_loop())
            self.game.running = True

            # Ajouter le jeu à games_pool
            games_pool[self.game_id] = {
                "game": self.game,
                "connections": 1,  # Premier client connecté
            }

        await self.accept()

        # Envoyer l'état initial ou mis à jour du jeu
        await self.send(
            text_data=json.dumps(
                {"type": "init", "game": await build_game_state(self.game)}
            )
        )
    def get_game_from_db(self, game_id):
        """
        Méthode pour récupérer une instance de Game depuis la base de données
        """
        try:
            return GameDB.objects.get(game_ws_id=game_id)
        except GameDB.DoesNotExist:
            return None

    def log_game_state(self, context):
        """
        Log the current state of the game including paddle positions, ball position,
        ball speed, and scores.

        :param context: A string to describe the context from which this log is called.
        """
        paddle_positions = [(paddle.x, paddle.y) for paddle in self.game.paddles]
        ball_position = (self.game.ball.x, self.game.ball.y)
        ball_speed = self.game.ball.speed
        scores = self.game.score

        logger.info(
            f"Game {self.game_id} state - Context: {context} - "
            f"Paddles: {paddle_positions}, "
            f"Ball Position: {ball_position}, "
            f"Ball Speed: {ball_speed}, "
            f"Scores: {scores}"
        )

    async def notifyEvent(self, eventData):
        await self.channel_layer.group_send(
            self.group_name, {"type": "gameEvent", "event": eventData}
        )

    async def gameEvent(self, event):
        # Envoyer l'événement reçu à ce client spécifique
        await self.send(text_data=json.dumps(event["event"]))

    async def receive(self, text_data=None, bytes_data=None):
        text_data_json = json.loads(text_data)

        if text_data_json["key"] in ["w", "s", "space"]:
            who = 0  # Joueur 1 (gauche)
        elif text_data_json["key"] in ["arrowup", "arrowdown"]:
            who = 1  # Joueur 2 (droite)
        else:
            return

        if text_data_json["type"] == "keydown" or text_data_json["type"] == "keyup":
            await handle_key(
                self.game, text_data_json["type"], text_data_json["key"], who
            )

    async def game_update(self):
        while self.game.running:
            await asyncio.sleep(1 / 60)
            await self.send(text_data=json.dumps(await update_game_state(self.game)))

    async def disconnect(self, close_code):
        logger.info(f"Client disconnected from game {self.game_id}")

        # Retirer le client du groupe
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

        if self.game_id in games_pool:
            games_pool[self.game_id]["connections"] -= 1

            # Attendre un délai pour permettre aux clients de se reconnecter
            await asyncio.sleep(10)

            # Vérifier s'il reste des connexions après le délai
        if (
            self.game_id in games_pool
            and games_pool[self.game_id]["connections"] <= 0
        ):
            logger.info(f"No more connections for game {self.game_id}. Cleaning up.")

            # Annuler la tâche de physique si elle est en cours d'exécution
            if hasattr(self, "physics_task") and not self.physics_task.done():
                self.physics_task.cancel()
                try:
                    await self.physics_task
                except asyncio.CancelledError:
                    logger.info(
                        f"Physics task for game {self.game_id} has been cancelled."
                    )

            games_pool.pop(self.game_id, None)
            logger.info(f"Current games_pool state after cleanup: {games_pool}")


async def handle_key(game, types, key, who):
    if types not in ["keydown", "keyup"]:
        return


    if key == "space" and types == "keydown":
        if not getattr(game, 'pause_handled', False):
            if game.isPaused:
                game.resume()
            else:
                game.pause()
            game.pause_handled = True
        return
    elif key == "space" and types == "keyup":
        game.pause_handled = False 

    action = None
    if key in ["w", "arrowup"]:
        action = "up"
    elif key in ["s", "arrowdown"]:
        action = "down"
    
    if action is None:
        return

    paddle = game.paddles[who]

    # Mettre à jour l'état de la touche dans le dictionnaire
    if types == "keydown":
        paddle.keys_pressed[action] = True
    elif types == "keyup":
        paddle.keys_pressed[action] = False

    # Gestion des mouvements en fonction des touches pressées
    if paddle.keys_pressed['up'] and not paddle.keys_pressed['down']:
        paddle.velocity = -1  # Monter
    elif paddle.keys_pressed['down'] and not paddle.keys_pressed['up']:
        paddle.velocity = 1  # Descendre
    else:
        paddle.velocity = 0  # Aucun mouvement si les deux touches sont relâchées ou pressées
    # logger.debug(f"Paddle update - Player: {who}, Action: {action}, Type: {types}, New Velocity: {game.paddles[who].velocity}")
    # logger.debug(f"New Paddle0 Position: x={game.paddles[0].x} y={game.paddles[0].y}")
    # logger.debug(f"New Paddle1 Position: x={game.paddles[1].x} y={game.paddles[1].y}")


async def build_game_state(game):
    return {
        "type": "initGame",
        "game_id": game.id,
        "width": game.width,
        "height": game.height,
        "timer": game.maxTimer - game.timer,
        "playerNames": [player.name for player in game.players],
        "players": [
            {
                "id": paddle.user_id,
                "position": paddle.get_position(),
                "color": paddle.color,
                "side": paddle.side,
                "width": paddle.width,
                "height": paddle.height,
            }
            for paddle in game.paddles
        ],
        "ball": {
            "x": game.ball.x,
            "y": game.ball.y,
            "vel_x": game.ball.vel_x,
            "vel_y": game.ball.vel_y,
            "color": game.ball.color,
            "speed": game.ball.speed,
            "size": game.ball.size,
        },
        "score": game.score,
        "isPlayed": game.isPlayed,
        "isPaused": game.isPaused
    }


async def update_game_state(game):
    return {
        "type": "update",
        "game_id": game.id,
        "width": game.width,
        "height": game.height,
        "timer": game.maxTimer - game.timer,
        "players": [
            {
                "id": paddle.user_id,
                "position": paddle.get_position(),
                "color": paddle.color,
                "side": paddle.side,
                "width": paddle.width,
                "height": paddle.height,
            }
            for paddle in game.paddles
        ],
        "ball": {
            "x": game.ball.x,
            "y": game.ball.y,
            "vel_x": game.ball.vel_x,
            "vel_y": game.ball.vel_y,
            "color": game.ball.color,
            "speed": game.ball.speed,
            "size": game.ball.size,
        },
        "score": game.score,
        "isPlayed": game.isPlayed,
        "isPaused": game.isPaused
    }
