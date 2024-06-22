from time import sleep


class Paddle:
	def __init__(self, x, color):
		self.x = x
		self.y = 216
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
		self.speed = 0.5
		self.bounce = 1
		self.color = color

	def get_position(self):
		return (self.x, self.y)

	def add_speed(self, speed):
		self.speed += speed
	
	def reset(self):
		self.x = 560
		self.y = 360
		self.speed = 0.5
	
	def collision(self, paddle):
		
		if self.x == 0:
			self.reset()
		if self.x == 1280:
			self.reset()
	
	def physics(self, paddles):
		self.x += self.speed
		self.y += self.speed

		for paddle in paddles:
			self.collision(paddle)
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
			self.ball.physics(self.players)
			

class Tournament:
	def __init__(self, id, games):
		self.id = id
		self.games = games # il faut que ça soit une array de la class Game
