import json
import asyncio
import random
import time
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
from database.models import Game as GameDB
from userManager.models import UserInfos
from pong.logger import logger

class Paddle:
    def __init__(self, x, color, userId, arenaWidth, arenaHeight, updateCallBack=None):
        self.keys_pressed = {'up': False, 'down': False}
        self.width = 20
        self.height = 200
        self.x = x
        self.y = arenaHeight / 2
        self.color = color
        self.speed = 800
        self.velocity = 0
        self.bounce = 1
        self.keys_pressed = {
            "up": False,
            "down": False,
            "backspin": False,
            "topspin": False
        }
        self.side = 0 if x <= arenaWidth / 2 else 1  # 0 = gauche, 1 = droite
        self.user_id = userId
        self.updateCallBack = updateCallBack
        self.backspin = False
        self.topspin = False

    def move(self, delta_time):
        self.y += self.speed * self.velocity * delta_time
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
        self.speed = 400
        self.maxSpeed = 2000
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
        self.speed = min(self.speed + speed, 20)

    def reset(self):
        self.x = self.arenaWidth / 2
        self.y = self.arenaHeight / 2
        self.speed = self.initialSpeed
        self.vel_x = -1 if random.choice([True, False]) else 1
        self.vel_y = 0

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
        self.vel_x = -self.vel_x

        impact_factor = 0.6  # Facteur d'influence, ajustable
        self.vel_y += paddle.velocity * impact_factor

        speed_influence = 1 + abs(paddle.velocity) * 0.17
        self.vel_x *= speed_influence
        self.vel_y *= speed_influence

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

    async def physics_update(self, paddles, score, delta_time):
        if self.wall_collision(score):
            if self.updateCallBack:
                asyncio.create_task(self.updateCallBack({
                    'type': 'refreshBallData',
                    'ball': {
                        'x': self.x,
                        'y': self.y,
                        'vel_x': self.vel_x,
                        'vel_y': self.vel_y,
                        'speed': self.speed
                    }
                }))
        else:
            for paddle in paddles:
                if self.collision(paddle):
                    if self.updateCallBack:
                        asyncio.create_task(self.updateCallBack({
                            'type': 'refreshBallData',
                            'ball': {
                                'x': self.x,
                                'y': self.y,
                                'vel_x': self.vel_x,
                                'vel_y': self.vel_y,
                                'speed': self.speed
                            }
                        }))
                    break
        self.x += self.speed * self.vel_x * delta_time
        self.y += self.speed * self.vel_y * delta_time

class Game:
    def __init__(
        self, 
        id, 
        players, 
        nb_max_players=100, 
        width=1280, 
        height=720, 
        updateCallBack=None, 
        type='localGame', 
        timer=0, 
        maxScore=3, 
        topspin=False, 
        backspin=False, 
        sidespin=False
    ):
        self.id = id
        self.type = type
        self.timer = 0
        self.maxTimer = timer
        self.score = [0, 0]
        self.maxScore = maxScore
        self.running = False
        self.isPlayed = False
        self.isPaused = True
        self.winner = None
        self.loser = None
        self.width = width
        self.height = height
        self.nb_max_players = nb_max_players
        self.updateCallBack = updateCallBack
        self.players = players
        self.paddles = []
        self.ball = Ball((255, 255, 255), width, height, updateCallBack)
        self.allowTopspin = topspin
        self.allowBackspin = backspin
        self.allowSidespin = sidespin

    async def countdown_before_start(self):
        """Envoie un décompte de 3 secondes avant le début de la partie."""
        countdown = 3
        await asyncio.sleep(1)
        while countdown > 0:
            if self.updateCallBack:
                await self.updateCallBack({
                    'type': 'countdown',
                    'value': countdown
                })
            countdown -= 1
            await asyncio.sleep(1)

        if self.updateCallBack:
            await self.updateCallBack({
                'type': 'countdown',
                'value': "GO!"
            })
        await asyncio.sleep(1)

    def pause(self):
        self.isPaused = True
        logger.info("Le jeu est en pause.")
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'gamePaused',
                'status': True,
                'ball': {
                    'x': self.ball.x,
                    'y': self.ball.y
                }
            }))

    def resume(self):
        self.isPaused = False
        logger.info("Le jeu reprend.")
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'gamePaused',
                'status': False
            }))

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

        self.pause()
        await self.countdown_before_start()
        last_time = time.time()
        self.resume()

        asyncio.create_task(self.start_timer())
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'gamePaused',
                'status': False
            }))

        while not self.running:
            await asyncio.sleep(0.1)

        while self.running:
            if self.isPaused:
                await asyncio.sleep(0.1)
                last_time = time.time()
                continue

            current_time = time.time()
            frame_time = current_time - last_time
            last_time = current_time

            accumulator += frame_time

            while accumulator >= fixed_time_step:
                await self.update_physics(fixed_time_step)
                accumulator -= fixed_time_step

            await asyncio.sleep(0.001)

    async def start_timer(self):
        while self.running:
            if self.isPaused:
                await asyncio.sleep(0.1)
                continue

            await asyncio.sleep(1)
            self.timer += 1

            if self.updateCallBack:
                await self.updateCallBack({
                    'type': 'timerUpdate',
                    'timer': self.maxTimer - self.timer
                })

            if self.timer >= self.maxTimer + 1:
                self.running = False
                self.determine_winner_and_loser()

    async def update_physics(self, delta_time):
        if self.isPaused:
            return
        for paddle in self.paddles:
            if paddle.velocity != 0:
                paddle.move(delta_time)

            if paddle.y - paddle.height / 2 < 0:
                paddle.y = paddle.height / 2
            elif paddle.y + paddle.height / 2 > self.height:
                paddle.y = self.height - paddle.height / 2

        await self.ball.physics_update(self.paddles, self.score, delta_time)

        if self.score[0] >= self.maxScore or self.score[1] >= self.maxScore:
            self.running = False
            self.determine_winner_and_loser()

    def determine_winner_and_loser(self):
        if self.score[0] > self.score[1]:
            self.winner = self.players[0]
            self.loser = self.players[1]
        else:
            self.winner = self.players[1]
            self.loser = self.players[0]
        if self.updateCallBack:
            asyncio.create_task(self.updateCallBack({
                'type': 'clearGameId',
                'gameType': self.type
            }))
        if self.type == 'dbGame':
            asyncio.create_task(self.save_scores_to_db())

        self.isPlayed = True
        logger.debug(f"Le gagnant est {self.winner}, le perdant est {self.loser}.")

    async def save_scores_to_db(self):
        """Update the scores in the database for dbGame games and manage tournament progression."""
        try:
            game_db = await sync_to_async(GameDB.objects.get)(game_ws_id=self.id)

            game_db.points1 = self.score[0]
            game_db.points2 = self.score[1]

            winner = self.winner
            loser = self.loser

            await sync_to_async(game_db.finalize_game)()

            await sync_to_async(game_db.save)()
            logger.info(f"Scores saved to database for game {self.id}: {self.score[0]} - {self.score[1]}")

        except GameDB.DoesNotExist:
            logger.error(f"Game with ID {self.id} not found in the database.")

class Player:
    def __init__(self, id, skin, name):
        self.id = id
        self.skin = skin
        self.name = name
