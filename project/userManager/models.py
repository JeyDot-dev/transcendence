from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import validate_email, ValidationError
from database.models import Game


class UserInfos(AbstractUser):
    profile_pic = models.ImageField(
        upload_to="profile_pics/",
        default="profile_pics/default.jpg",
        blank=True,
        null=True,
    )
    status = models.CharField(max_length=20)
    is_online = models.BooleanField(default=False)
    is_playing = models.BooleanField(default=False)
    grade = models.IntegerField(default=0)
    total_games = models.IntegerField(default=0)
    total_victories = models.IntegerField(default=0)
    skin = models.CharField(max_length=7, default="#FFFFFF")
    last_tournament_id = models.CharField(max_length=200, default="")
    is_3d = models.BooleanField(default=False)
    friends = models.ManyToManyField("self", blank=True)
    friends_requests = models.ManyToManyField("self", blank=True)
    match_history = models.ManyToManyField(Game, blank=True)

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
        self.username = username
        self.save()

    def set_email(self, email: str):
        try:
            validate_email(email)
            self.email = email
            self.save()
        except ValidationError:
            # Gérer l'erreur de validation ici
            raise ValueError("L'email fourni n'est pas valide.")

    def set_skin(self, skin: str):
        self.skin = skin
        self.save()

    def set_status(self, status: str):
        self.status = status
        self.save()

    def set_online(self, is_online: bool):
        self.is_online = is_online
        self.save()

    def set_playing(self, is_playing: bool):
        self.is_playing = is_playing
        self.save()

    def set_grade(self, grade: int):
        self.grade = grade
        self.save()

    def set_total_games(self, total_games: int):
        self.total_games = total_games
        self.save()

    def set_total_victories(self, total_victories: int):
        self.total_victories = total_victories
        self.save()

    def set_last_tournament_id(self, last_tournament_id: str):
        self.last_tournament_id = last_tournament_id
        self.save()

    def set_3d(self, is_3d: bool):
        self.is_3d = is_3d
        self.save()

    def add_friend(self, friend_username: str):
        friend = UserInfos.objects.get(username=friend_username)
        if friend is self:
            raise ValueError("Vous ne pouvez pas vous ajouter en tant qu'ami.")
        if not friend:
            raise ValueError("L'utilisateur n'existe pas.")
        if friend in self.friends.all():
            raise ValueError("L'utilisateur est déjà votre ami.")
        if friend in self.friends_requests.all():
            self.friends.add(friend)
            friend.friends.add(self)
            self.friends_requests.remove(friend)
            friend.friends_requests.remove(self)
        else:
            friend.friends_requests.add(self)
            self.friends_requests.add(friend)

        self.save()


class MatchResults(models.Model):
	winner = models.ForeignKey(UserInfos, on_delete=models.CASCADE, related_name='winner')
	loser = models.ForeignKey(UserInfos, on_delete=models.CASCADE, related_name='loser')
	score_left = models.IntegerField(default=0)
	score_right = models.IntegerField(default=0)
	date = models.DateTimeField(auto_now_add=True)
	tournament_id = models.CharField(max_length=200, default="")

	def __str__(self):
		return f"{self.winner.username} vs {self.loser.username} ({self.date})"

	def to_dict(self):
		return {
			"winner": self.winner.username,
			"loser": self.loser.username,
			"date": self.date,
			"score_left": self.score_left,
			"score_right": self.score_right,
			"tournament_id": self.tournament_id
		}

	def set_tournament_id(self, tournament_id: str):
		self.tournament_id = tournament_id
		self.save()
    
	def set_score(self, score_left: int, score_right: int):
		self.score_left = score_left
		self.score_right = score_right
		self.save()