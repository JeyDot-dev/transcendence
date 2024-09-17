from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email, ValidationError
from django.db import models
import re

class UserInfos(AbstractUser):
	profile_pic = models.ImageField(
		upload_to="profile_pics/",
		default="profile_pics/default.jpg",
		blank=True,
		null=True,
	)
	status = models.CharField(max_length=142, default="Hello, I'm new here!")
	is_online = models.BooleanField(default=False)
	is_playing = models.BooleanField(default=False)
	grade = models.IntegerField(default=0)
	total_games = models.IntegerField(default=0)
	total_victories = models.IntegerField(default=0)
	skin = models.CharField(max_length=7, default="#FFFFFF")
	last_tournament_id = models.CharField(max_length=200, default="")
	is_3d = models.BooleanField(default=False)
	friends = models.ManyToManyField("self", blank=True)
	friends_requests = models.ManyToManyField("UserInfos", symmetrical=False, blank=True)
	match_history = models.ManyToManyField('database.Game', blank=True)

	REQUIRED_FIELDS = ["email", "password"]

	def __str__(self):
		return f"{self.username} ({self.id})"

	def to_dict(self):
		return {
			"username": self.username,
			"profile_pic": self.profile_pic.url,
			"status": self.status,
			"is_online": self.is_online,
			"is_playing": self.is_playing,
			"grade": self.grade,
			"total_games": self.total_games,
			"total_victories": self.total_victories,
			"skin": self.skin,
			"friends": [friend.id for friend in self.friends.all()],
			"friends_requests": [friend.id for friend in self.friends_requests.all()],
		}

	def to_dict_public(self):
			return {
				"username": self.username,
				"profile_pic": self.profile_pic.url,
				"status": self.status,
				"is_online": self.is_online,
				"is_playing": self.is_playing,
				"grade": self.grade,
				"total_games": self.total_games,
				"total_victories": self.total_victories,
				"skin": self.skin
			}

	def get_last_tournament_id(self):
		return self.last_tournament_id

	def set_username(self, username: str):
		if len(username) < 3 or len(username) > 100:
			raise ValueError("Le nom d'utilisateur doit faire entre 3 et 100 caractères.")
		self.username = username
		self.save()

	def set_email(self, email: str):
		try:
			validate_email(email)
			self.email = email
			self.save()
		except ValidationError:
			raise ValueError("L'email fourni n'est pas valide.")

	def set_skin(self, skin: str):
		if not re.match(r'^#[a-fA-F0-9]{6}$', skin):
			raise ValueError("Le skin doit être un code couleur hexadécimal.")
		if not re.match(r'^#[a-fA-F0-9]{6}$', skin):
			raise ValueError("Le skin doit être un code couleur hexadécimal.")
		self.skin = skin
		self.save()

	def set_status(self, status: str):
		if len(status) < 3 or len(status) > 142:
			raise ValueError("Le statut doit faire entre 3 et 142 caractères.")
		self.status = status
		self.save()

	def set_grade(self, grade: int):
		if grade < 0:
			raise ValueError("Le grade ne peut pas être négatif.")
		self.grade = grade
		self.save()

	def set_total_games(self, total_games: int):
		if total_games < 0:
			raise ValueError("Le nombre total de jeux ne peut pas être négatif.")
		if total_games < 0:
			raise ValueError("Le nombre total de jeux ne peut pas être négatif.")
		self.total_games = total_games
		self.save()

	def set_total_victories(self, total_victories: int):
		if total_victories < 0 or total_victories > self.total_games:
			raise ValueError("Le nombre total de victoires ne peut pas être négatif ou supérieur au nombre total de jeux.")
		self.total_victories = total_victories
		self.save()

	def set_online(self, is_online: bool):
		self.is_online = is_online
		self.save()

	def set_last_tournament_id(self, last_tournament_id: str):
		self.last_tournament_id = last_tournament_id
		self.save()

	def set_3d(self, is_3d: bool):
		self.is_3d = is_3d
		self.save()

	def add_friend(self, friend_username: str):
		try:
			friend = UserInfos.objects.get(username=friend_username)
		except UserInfos.DoesNotExist:
			raise ValueError("L'utilisateur n'existe pas.")
		
		if friend_username == self.username:
			raise ValueError("Vous ne pouvez pas vous ajouter en tant qu'ami.")
		
		if friend in self.friends.all():
			raise ValueError("L'utilisateur est déjà votre ami.")
		
		if friend not in self.friends_requests.all():
				friend.friends_requests.add(self)
				friend.save()
	
	def accept_friend_request(self, friend_username: str):
		try:
			friend = UserInfos.objects.get(username=friend_username)
		except UserInfos.DoesNotExist:
			raise ValueError("L'utilisateur n'existe pas.")
		
		if friend not in self.friends_requests.all():
			raise ValueError("L'utilisateur ne vous a pas envoyé de demande d'ami.")
		
		self.friends.add(friend)
		friend.friends.add(self)
		self.friends_requests.remove(friend)
		friend.save()
		self.save()

	def deny_friend_request(self, friend_username: str):
		try:
			friend = UserInfos.objects.get(username=friend_username)
		except UserInfos.DoesNotExist:
			raise ValueError("L'utilisateur n'existe pas.")
		
		if friend not in self.friends_requests.all():
			raise ValueError("L'utilisateur ne vous a pas envoyé de demande d'ami.")
		self.friends_requests.remove(friend)
		self.save()

	def remove_friend(self, friend_username: str):
		try:
			friend = UserInfos.objects.get(username=friend_username)
		except UserInfos.DoesNotExist:
			raise ValueError("L'utilisateur n'existe pas.")
		
		if friend not in self.friends.all():
			raise ValueError("L'utilisateur n'est pas votre ami.")
		
		self.friends.remove(friend)
		friend.friends.remove(self)
		self.save()
		friend.save()
