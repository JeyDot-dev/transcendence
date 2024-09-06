import asyncio
import random
import time
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from userManager.models import UserInfos

logger2 = logging.getLogger(__name__)

class Paddle:
    def __init__(self, x, color, userId, arenaWidth, arenaHeight, updateCallBack=None):
        self.width = 20
        self.height = 200
        self.x = x
        self.y = arenaHeight / 2
        self.color = color
        self.speed = 15
        self.velocity = 0
        self.bounce = 1
        self.keys = {"up": 0, "down": 0}
        self.side = 0 if x <= arenaWidth / 2 else 1  # 0 = gauche, 1 = droite
        self.user_id = userId
        self.updateCallBack = updateCallBack

    def move(self):
        self.y += self.speed * self.velocity
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'paddleMove',
                'paddle': {
                    'side': self.side,
                    'x': self.x,
                    'y': self.y
                }
            }))

    def get_position(self):
        return self.x, self.y

    def get_bounds(self):
        half_width = self.width / 2
        half_height = self.height / 2
        return {
            'left': self.x - half_width,
            'right': self.x + half_width,
            'top': self.y - half_height,
            'bottom': self.y + half_height
        }

class Ball:
    def __init__(self, color, arenaWidth, arenaHeight, updateCallBack=None):
        self.x = arenaWidth / 2
        self.y = arenaHeight / 2
        self.speed = 5
        self.initialSpeed = self.speed
        self.vel_x = -1
        self.vel_y = 0
        self.bounce = 1
        self.size = 14
        self.color = color
        self.arenaWidth = arenaWidth
        self.arenaHeight = arenaHeight
        self.updateCallBack = updateCallBack

    def get_position(self):
        return self.x, self.y

    def get_bounds(self):
        half_size = self.size / 2
        return {
            'left': self.x - half_size,
            'right': self.x + half_size,
            'top': self.y - half_size,
            'bottom': self.y + half_size
        }

    def add_speed(self, speed):
        self.speed = min(self.speed + speed, 20)  # Limite la vitesse maximale à 20

    def reset(self):
        self.x = self.arenaWidth / 2
        self.y = self.arenaHeight / 2
        self.speed = self.initialSpeed
        self.vel_x = -1 if random.choice([True, False]) else 1
        self.vel_y = 0
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'ballMove',
                'ball': {
                    'x': self.x,
                    'y': self.y
                }
            }))

    def predict_collision(self, paddle):
        future_x = self.x + self.vel_x * self.speed
        future_y = self.y + self.vel_y * self.speed
        ball_bounds = self._calculate_future_bounds(future_x, future_y)
        paddle_bounds = paddle.get_bounds()

        return self._check_collision(ball_bounds, paddle_bounds)

    def collision(self, paddle):
        ball_bounds = self.get_bounds()
        paddle_bounds = paddle.get_bounds()

        if self._check_collision(ball_bounds, paddle_bounds):
            self._handle_collision(paddle, paddle_bounds)
            return True
        return False

    def _calculate_future_bounds(self, future_x, future_y):
        half_size = self.size / 2
        return {
            'left': future_x - half_size,
            'right': future_x + half_size,
            'top': future_y - half_size,
            'bottom': future_y + half_size
        }

    def _check_collision(self, ball_bounds, paddle_bounds):
        return (
            ball_bounds['right'] >= paddle_bounds['left'] and
            ball_bounds['left'] <= paddle_bounds['right'] and
            ball_bounds['bottom'] >= paddle_bounds['top'] and
            ball_bounds['top'] <= paddle_bounds['bottom']
        )

    def _handle_collision(self, paddle, paddle_bounds):
        # Inverser la direction horizontale de la balle
        self.vel_x = -self.vel_x

        # Calcul de l'influence de la vélocité du paddle sur la balle
        impact_factor = 0.5  # Facteur d'influence, ajustable
        self.vel_y += paddle.velocity * impact_factor

        # Ajuster la vitesse totale de la balle en fonction de la vélocité du paddle
        speed_influence = 1 + abs(paddle.velocity) * 0.2
        self.vel_x *= speed_influence
        self.vel_y *= speed_influence

        # Repositionner la balle pour qu'elle soit juste à l'extérieur du paddle
        if self.vel_x > 0:
            self.x = paddle_bounds['right'] + self.size / 2 + 1
        else:
            self.x = paddle_bounds['left'] - self.size / 2 - 1

    def wall_collision(self, score):
        if self.y - self.size / 2 <= 0:
            self.y = self.size / 2
            self.vel_y = -self.vel_y
            return True
        elif self.y + self.size / 2 >= self.arenaHeight:
            self.y = self.arenaHeight - self.size / 2
            self.vel_y = -self.vel_y
            return True

        if self.x <= 0:
            score[1] += 1
            self.reset()
            if self.updateCallBack:
                asyncio.create_task(self.updateCallBack({
                    'type': 'scoreChange1',
                    'score': score
                }))
            return True
        elif self.x >= self.arenaWidth:
            score[0] += 1
            self.reset()
            if self.updateCallBack:
                asyncio.create_task(self.updateCallBack({
                    'type': 'scoreChange0',
                    'score': score
                }))
            return True
        return False

    async def physics_update(self, paddles, score):
        if not self.wall_collision(score):
            for paddle in paddles:
                if self.collision(paddle):
                    break

        self.x += self.speed * self.vel_x
        self.y += self.speed * self.vel_y
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'ballMove',
                'ball': {
                    'x': self.x,
                    'y': self.y
                }
            }))

class Game:
    def __init__(self, id, players, nb_max_players=100, width=1280, height=720, updateCallBack=None):
        self.id = id
        self.timer = 0
        self.score = [0, 0]
        self.running = False
        self.winners = []
        self.width = width
        self.height = height
        self.nb_max_players = nb_max_players
        self.updateCallBack = updateCallBack
        self.players = players
        self.paddles = []
        self.ball = Ball((255, 255, 255), width, height, updateCallBack)
        logger2.debug("Backend Game Constructor")

    def addPlayer(self, player: UserInfos, side: int):
        if len(self.players) < self.nb_max_players:
            self.players.append(player)
            paddle_x = 100 if side == 0 else self.width - 100
            paddle = Paddle(paddle_x, player.skin, player.id, self.width, self.height, self.updateCallBack)
            self.paddles.append(paddle)
        else:
            raise ValueError("Le jeu est complet")

    async def physics_loop(self):
        fixed_time_step = 1.0 / 60.0  # 60 Hz
        accumulator = 0.0
        last_time = time.time()

        while not self.running:
            await asyncio.sleep(0.1)  # Attendre que le jeu commence

        while self.running:
            current_time = time.time()
            frame_time = current_time - last_time
            last_time = current_time
            accumulator += frame_time

            while accumulator >= fixed_time_step:
                await self.update_physics(fixed_time_step)
                accumulator -= fixed_time_step

            await asyncio.sleep(0.001)

    async def update_physics(self, delta_time):
        for paddle in self.paddles:
            if paddle.velocity != 0:
                paddle.move()

            if paddle.y - paddle.height / 2 < 0:
                paddle.y = paddle.height / 2
            elif paddle.y + paddle.height / 2 > self.height:
                paddle.y = self.height - paddle.height / 2

        await self.ball.physics_update(self.paddles, self.score)

        if self.score[0] >= 50 or self.score[1] >= 50:
            self.running = False

class Player:
    def __init__(self, id, skin):
        self.id = id
        self.skin = skin