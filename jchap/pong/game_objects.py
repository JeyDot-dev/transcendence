import asyncio
import random
from userManager.models import UserInfos

class Paddle:
	def __init__(self, x, color, user_id):
		self.x = x
		self.y = 216 # Middle of the screen
		self.width = 28
		self.color = color # #FFFFFF
		self.speed = 15
		self.bounce = 1
		self.keys = { "up": 0, "down": 0 }
		self.side: int = 0 if x <= 1280 / 2 else 1 # 0 = left, 1 = right
		self.user_id = user_id

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
		if self.y + self.size < paddle_y or self.y > paddle_y + (self.size * 20): return False # Ball is not in the same y range as the paddle

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
	def __init__(self, id, players, ball, nb_max_players=2):
		self.id = id
		self.players:list[UserInfos] = players 
		self.paddles:list[Paddle] = []
		self.ball = ball
		self.score = [0, 0]
		self.timer = 0
		self.running = False
		self.nb_max_players = nb_max_players
		self.winners = []
	
	def add_player(self, player: UserInfos, side: int):
		if len(self.players) < self.nb_max_players:
			player_skin = player.get_skin()
			self.players.append(player)
			self.paddles.append(Paddle(0 if side == 0 else 1280 - 28, player.skin, player.id))
		else:
			raise ValueError("Game is full")
	
	async def physics(self):
		while not self.running:
			await asyncio.sleep(1)
		while self.running:
			await asyncio.sleep(60 / 1000)
			for paddle in self.paddles:
				if paddle.keys["up"] == 1:
					paddle.move(-paddle.speed)
				elif paddle.keys["down"] == 1:
					paddle.move(paddle.speed)
				if paddle.y < 0:
					paddle.y = 0
				elif paddle.y > 432:
					paddle.y = 432
			await self.ball.physics(self.paddles, self.score)
			if self.score[0] >= 5 or self.score[1] >= 5:
				self.running = False
			

class Tournament:
	def __init__(self, id, nb_player_per_team=1, nb_players=4):
		# verify:
		if nb_players % nb_player_per_team != 0:
			raise ValueError("nb_players must be a multiple of nb_player_per_team")
		if nb_players < 2 or nb_player_per_team < 1:
			raise ValueError("nb_players must be at least 2 and nb_player_per_team at least 1")
		
		self.id = id
		self.nb_player_per_team = nb_player_per_team
		self.nb_players = nb_players
		self.finished = False
		self.winner: list[str] = []
		self.ready = False
		
		self.games: list[str] = []
		self.players: list[str] = []

		for i in range(0, nb_players / 2, nb_player_per_team):
			new_id = "turnament_" + str(id) + "_game_" + str(i)
			self.games.append(new_id)

	def add_player(self, player):
		self.players.append(player)
		if len(self.players) == self.nb_players:
			self.ready = True
	
	def randomize_teams(self):
		if not self.ready:
			raise ValueError("Not enough players")
		random.shuffle(self.players)

	def get_game_id(self, username):
		for game in self.games:
			for player in game.players:
				if player.username == username:
					return self.game.id
		return None
	
	def start(self):
		if not self.ready:
			raise ValueError("Not enough players")
		for i in range(0, self.nb_players / 2, self.nb_player_per_team):
			for j in range(0, self.nb_player_per_team):
				self.games[i].add_player(self.players[i + j])
		for game in self.games:
			asyncio.create_task(game.physics())
						


