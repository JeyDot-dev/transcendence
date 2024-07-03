import asyncio

from time import sleep

class Paddle:
	def __init__(self, x, color):
		self.x = x
		self.y = 216
		self.width = 28
		self.color = color # (r, g, b)
		self.speed = 15
		self.bounce = 1
		self.keys = { "up": 0, "down": 0 }

	def move(self, dy):
		self.y += dy

	def get_position(self):
		return (self.x, self.y)

class Ball:
	def __init__(self, x, y, color):
		self.x = x
		self.y = y
		self.speed = 10
		self.vel_x = -1
		self.vel_y = 1
		self.bounce = 1
		self.size = 14
		self.color = color

	def get_position(self):
		return (self.x, self.y)

	def add_speed(self, speed):
		self.speed += speed
	
	def reset(self):
		self.x = 1280 / 2 - self.size / 2
		self.y = 720 / 2  - self.size / 2
		self.speed = 10
	
	def collision(self, paddle):
		paddle_x, paddle_y = paddle.get_position()
		if self.vel_x > 0 and paddle_x < 1280 / 2: return False
		elif self.vel_x < 0 and paddle_x > 1280 / 2: return False

		if self.x > paddle_x + paddle.width or self.x + self.size < paddle_x: return False # Ball is not in the same x range as the paddle
		if self.y + self.size < paddle_y or self.y > paddle_y + 432: return False # Ball is not in the same y range as the paddle

		self.x = paddle_x + paddle.width + 1 if self.vel_x < 0 else paddle_x - self.size - 1
		self.vel_x = -self.vel_x
		self.add_speed(1)
		return True
	
	def wall_collision(self, score):
		if self.y <= 0:
			self.y = 1
			self.vel_y = -self.vel_y
			return True
		elif self.y >= 720 - self.size:
			self.y = 720 - self.size - 1
			self.vel_y = -self.vel_y
			return True
		
		if self.x <= 0:
			score[1] += 1
			self.reset()
			return True
		elif self.x >= 1280:
			score[0] += 1
			self.reset()
			return True
		return False
	
	async def physics(self, paddles, score):
		if not self.wall_collision(score):
			for paddle in paddles:
				if self.collision(paddle):
					break

		self.x += self.speed * self.vel_x
		self.y += self.speed * self.vel_y

class Game:
	def __init__(self, id, players, ball):
		self.id = id
		self.players = players # il faut que ça soit une array de la class Paddle
		self.ball = ball
		self.score = [0, 0]
		self.timer = 0
		self.running = True
	
	async def physics(self):
		while not self.running:
			await asyncio.sleep(1)
		while self.running:
			await asyncio.sleep(60 / 1000)
			for player in self.players:
				if player.keys["up"] == 1:
					player.move(-player.speed)
				elif player.keys["down"] == 1:
					player.move(player.speed)
				if player.y < 0:
					player.y = 0
				elif player.y > 432:
					player.y = 432
			await self.ball.physics(self.players, self.score)
			

class Tournament:
	def __init__(self, id, games):
		self.id = id
		self.games = games # il faut que ça soit une array de la class Game
