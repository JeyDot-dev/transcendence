import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .game_objects import Paddle, Ball
import asyncio

class PongConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.game_id = self.scope['url_route']['kwargs']['game_id']
        await self.accept()
        self.paddle_height = 100
        self.canvas_width = 800
        self.canvas_height = 400
        self.player_paddle = Paddle(50, (self.canvas_height - self.paddle_height) / 2, 10, self.paddle_height, self.canvas_height)
        self.ai_paddle = Paddle(self.canvas_width - 50, (self.canvas_height - self.paddle_height) / 2, 10, self.paddle_height, self.canvas_height)
        self.ball = Ball(self.canvas_width / 2, self.canvas_height / 2, 10, 5, 5, self.canvas_width, self.canvas_height)
        # Mettez en place la logique de framerate
        self.framerate = 60  # Nombre de mises à jour par seconde
        self.player_score = 0
        self.ai_score = 0
        self.running = True
        asyncio.ensure_future(self.game_loop())

    async def disconnect(self, close_code):
        self.running = False  # Arrêtez la boucle de jeu lors de la déconnexion

    async def game_loop(self):
        while self.running:
            await asyncio.sleep(1 / self.framerate)  # Attendre jusqu'à la prochaine mise à jour
            self.update_game_state()  # Mettre à jour l'état du jeu
            await self.send_game_state()  # Envoyer l'état du jeu aux clients

    async def receive(self, text_data):
        data = json.loads(text_data)
        self.player_paddle.move(data['playerY'])  # Mettre à jour la position du paddle du joueur

    async def send_game_state(self):
        await self.send(text_data=json.dumps({
            'playerY': self.player_paddle.y,
			'playerX': self.player_paddle.x,
            'aiX': self.ai_paddle.x,
            'aiY': self.ai_paddle.y,
            'playerScore': self.player_score,
            'aiScore': self.ai_score,
            'ballX': self.ball.x,
            'ballY': self.ball.y,
            'gameId': str(self.game_id)
        }))

    def update_game_state(self):
        self.ball.move()
        if self.player_paddle.is_ball_approaching(self.ball):
            self.player_paddle.handle_collision_left(self.ball)
        if self.ai_paddle.is_ball_approaching(self.ball):
            self.ai_paddle.handle_collision_right(self.ball)
        #Score
        if self.ball.x - self.ball.radius < 0:
            self.ai_score += 1
            self.ball.reset()
        elif self.ball.x + self.ball.radius > self.canvas_width:
            self.player_score += 1
            self.ball.reset()

        if self.ball.x - self.ball.radius < 0 or self.ball.x + self.ball.radius > self.canvas_width:
            self.ball.reset()
        self.ai_paddle.move(self.ball.y - self.ai_paddle.height / 2)
        #self.player_paddle.move(self.ball.y - self.ai_paddle.height / 2)


