class Paddle:
	def __init__(self, x, color):
		self.x = x
		self.y = 0
		self.color = color # (r, g, b)
		self.speed = 1
		self.bounce = 1

	def move(self, dy):
		self.y += dy

	def get_position(self):
		return (self.x, self.y)


class Ball:
	def __init__(self, x, y, color):
		self.x = x
		self.y = y
		self.speed = 0.5
		self.color = color
	
	def move(self, dx, dy):
		self.x += dx
		self.y += dy

	def get_position(self):
		return (self.x, self.y)

	def add_speed(self, speed):
		self.speed += speed

class Game:
	def __init__(self, id, players):
		self.id = id
		self.players = players # il faut que ça soit une array de la class Paddle
		self.ball = Ball(0, 0, (255, 255, 255))
		self.score = [0, 0]
		self.timer = 0

class Tournament:
	def __init__(self, id, games):
		self.id = id
		self.games = games # il faut que ça soit une array de la class Game
