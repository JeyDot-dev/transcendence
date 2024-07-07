from django.db import models
from django.contrib.auth.models import AbstractUser

class UserInfos(AbstractUser):
	profile_pic = models.CharField(max_length=200)
	status = models.CharField(max_length=20)
	is_online = models.BooleanField(default=False)
	is_playing = models.BooleanField(default=False)
	grade = models.IntegerField(default=0)
	total_games = models.IntegerField(default=0)
	total_victories = models.IntegerField(default=0)
	skin = models.CharField(max_length=7, default="#FFFFFF")
	last_tournament_id = models.CharField(max_length=200, default="")

	REQUIRED_FIELDS = ['email', 'password'] 

	def __str__(self):
		return self.username
	
	def to_dict(self):
		return {
			'username': self.username,
			'profile_pic': self.profile_pic,
			'status': self.status,
			'is_online': self.is_online,
			'is_playing': self.is_playing,
			'grade': self.grade,
			'total_games': self.total_games,
			'total_victories': self.total_victories,
			'skin': self.skin
		}
	
	def get_last_tournament_id(self):
		return self.last_tournament_id

	def set_skin(self, skin: str):
		self.skin = skin
		self.save()
	