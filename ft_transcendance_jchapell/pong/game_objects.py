from time import sleep


class Paddle:
	def __init__(self, x, color):
		self.x = x
		self.y = 216
		self.width = 28
		self.color = color # (r, g, b)
		self.speed = 1
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
		self.speed = 5
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
		self.x = 560
		self.y = 360
		self.speed = 5
	
	def collision(self, paddle):
		# if self.x + self.size >= paddle.x + paddle.width and self.y >= paddle.y and self.y <= paddle.y + (14*20):
		# 	self.x += paddle.width * self.vel_x
		# 	self.vel_x = -self.vel_x
		# 	self.add_speed(1)
		paddle_x, paddle_y = paddle.get_position()
		if self.x <= paddle_x + paddle.width:
			if self.y + self.size >= paddle_y and self.y <= paddle_y + (14*20):
				self.x = (paddle_x + paddle.width) * self.vel_x
				self.vel_x = -self.vel_x
				self.add_speed(1)
	
	def wall_collision(self, score):
		if self.y <= 0:
			self.y = 1
			self.vel_y = -self.vel_y
		elif self.y >= 706:
			self.y = 705
			self.vel_y = -self.vel_y
		
		if self.x <= 0:
			score[1] += 1
			self.reset()
		elif self.x >= 1266:
			score[0] += 1
			self.reset()
	
	def physics(self, paddles, score):
		self.wall_collision(score)

		for paddle in paddles:
			self.collision(paddle)

		self.x += self.speed * self.vel_x
		self.y += self.speed * self.vel_y

		sleep(0.01)

class Game:
	def __init__(self, id, players, ball):
		self.id = id
		self.players = players # il faut que ça soit une array de la class Paddle
		self.ball = ball
		self.score = [0, 0]
		self.timer = 0
	
	def physics(self):
		while True:
			sleep(0.01)
			for player in self.players:
				if player.keys["up"] == 1:
					player.move(-player.speed)
				elif player.keys["down"] == 1:
					player.move(player.speed)
				if player.y < 0:
					player.y = 0
				elif player.y > 432:
					player.y = 432
			self.ball.physics(self.players, self.score)
			

class Tournament:
	def __init__(self, id, games):
		self.id = id
		self.games = games # il faut que ça soit une array de la class Game
