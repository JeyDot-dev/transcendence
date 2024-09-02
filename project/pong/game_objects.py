import asyncio
import random
import time  # Ajout de l'importation du module time
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
        self.bounce = 1
        self.keys = {"up": 0, "down": 0}
        self.side = 0 if x <= arenaWidth / 2 else 1  # 0 = gauche, 1 = droite
        self.user_id = userId
        self.updateCallBack = updateCallBack

    def move(self, dy):
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'paddleMove',
                'paddle': {
                    'side': self.side,
                    'x': self.x,
                    'y': self.y
                }
            }))
        self.y += dy

    def get_position(self):
        return (self.x, self.y)

class Ball:
    def __init__(self, color, arenaWidht, arenaHeight, updateCallBack=None):
        self.x = arenaWidht / 2
        self.y = arenaHeight / 2
        self.speed = 5
        self.initialSpeed = self.speed
        self.vel_x = -1
        self.vel_y = 0
        self.bounce = 1
        self.size = 14
        self.color = color
        self.arenaWidth = arenaWidht
        self.arenaHeight = arenaHeight
        self.updateCallBack = updateCallBack

    def get_position(self):
        return (self.x, self.y)

    def add_speed(self, speed):
        self.speed += speed
        max_speed = 20  # Limite de vitesse maximale
        if self.speed > max_speed:
            self.speed = max_speed

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

    # Calcule du rebond de la balle pour la frame d'apres, aide si la balle vas trop vite
    def predict_collision(self, paddle):
        # Position future de la balle
        future_x = self.x + self.vel_x * self.speed
        future_y = self.y + self.vel_y * self.speed

        paddle_x, paddle_y = paddle.get_position()

        # Calculer les bords du paddle
        paddle_left = paddle_x - paddle.width / 2
        paddle_right = paddle_x + paddle.width / 2
        paddle_top = paddle_y - paddle.height / 2
        paddle_bottom = paddle_y + paddle.height / 2

        # Vérification de la collision prédite
        if (future_x + self.size / 2 >= paddle_left and future_x - self.size / 2 <= paddle_right):
            if (future_y + self.size / 2 >= paddle_top and future_y - self.size / 2 <= paddle_bottom):
                return True

        return False

    def collision(self, paddle):
        # Vérification de la collision actuelle
        paddle_x, paddle_y = paddle.get_position()

        # Calculer les bords du paddle
        paddle_left = paddle_x - paddle.width / 2
        paddle_right = paddle_x + paddle.width / 2
        paddle_top = paddle_y - paddle.height / 2
        paddle_bottom = paddle_y + paddle.height / 2

        # Calculer les bords de la balle
        ball_left = self.x - self.size / 2
        ball_right = self.x + self.size / 2
        ball_top = self.y - self.size / 2
        ball_bottom = self.y + self.size / 2

        # Vérification de la collision horizontale (balle entre les côtés du paddle)
        if ball_right >= paddle_left and ball_left <= paddle_right:
            # Vérification de la collision verticale (balle entre le haut et le bas du paddle)
            if ball_bottom >= paddle_top and ball_top <= paddle_bottom:
                # Inverser la direction horizontale de la balle
                self.vel_x = -self.vel_x

                # Repositionner la balle pour qu'elle soit juste à l'extérieur du paddle
                if self.vel_x > 0:  # Balle se déplace vers la droite
                    self.x = paddle_right + self.size / 2 + 1
                else:  # Balle se déplace vers la gauche
                    self.x = paddle_left - self.size / 2 - 1

                # Ajouter de la vitesse à la balle après la collision
                self.add_speed(1)
                return True

        return False

    def wall_collision(self, score):
        # Collision avec les murs haut et bas
        if self.y - self.size / 2 <= 0:
            self.y = self.size / 2
            self.vel_y = -self.vel_y
            return True
        elif self.y + self.size / 2 >= 720:
            self.y = 720 - self.size / 2
            self.vel_y = -self.vel_y
            return True

        # Collision avec les murs gauche et droit (score)
        if self.x <= 0:
            score[1] += 1
            self.reset()
            # Appeler le callback pour notifier le consumer
            if self.updateCallBack:
                asyncio.create_task(self.updateCallBack({
                    'type': 'scoreChange1',
                    'score': score
                }))
            return True
        elif self.x >= self.arenaWidth:
            score[0] += 1
            self.reset()
            # Appeler le callback pour notifier le consumer
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
    def __init__(self, id, players, nb_max_players=100, width = 1280, height = 720, updateCallBack=None):
        self.id = id
        self.timer = 0
        self.score = [0, 0]
        self.running = False
        self.winners = []
        self.width = width
        self.height = height
        self.nb_max_players = nb_max_players
        self.updateCallBack = updateCallBack
        self.players: list[UserInfos] = players
        self.paddles: list[Paddle] = []
        self.ball = Ball((255, 255, 255), width, height, updateCallBack)
        # self.lastActive = time.time()
        logger2.debug(f"Backend Game Constructor")

    def addPlayer(self, player: UserInfos, side: int):
        if len(self.players) < self.nb_max_players:
            self.players.append(player)
            paddle = Paddle(100 if side == 0 else self.width - 100, player.skin, player.id, self.width, self.height, self.updateCallBack)
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
                # Mettre à jour la physique avec le temps fixe
                await self.update_physics(fixed_time_step)
                accumulator -= fixed_time_step

            # Optionnel : Ajouter un petit sommeil pour éviter une boucle trop rapide
            await asyncio.sleep(0.001)

    async def update_physics(self, delta_time):
        # Déplacement des paddles
        for paddle in self.paddles:
            if paddle.keys["up"] == 1:
                paddle.move(-paddle.speed)
            elif paddle.keys["down"] == 1:
                paddle.move(paddle.speed)

            # Empêcher les paddles de sortir de l'écran
            if paddle.y - paddle.height / 2 < 0:
                paddle.y = paddle.height / 2
            elif paddle.y + paddle.height / 2 > self.height:
                paddle.y = self.height - paddle.height / 2

        # Mettre à jour la physique de la balle
        await self.ball.physics_update(self.paddles, self.score)

        # Vérifier les conditions de victoire
        if self.score[0] >= 50 or self.score[1] >= 50:
            self.running = False

class Player:
    def __init__(self, id, skin):
        self.id = id
        self.skin = skin
