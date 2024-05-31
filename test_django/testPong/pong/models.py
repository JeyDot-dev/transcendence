from django.db import models

# Create your models here.

class chatMessage(models.Model):
	message = models.CharField(max_length=200)
	created = models.DateTimeField(auto_now_add=True)
	sender = models.CharField(max_length=200)
	read = models.BooleanField(default=False)

class chatUser(models.Model):
	username = models.CharField(max_length=16)
	profilPic = models.CharField(max_length=255)
	status = models.CharField(max_length=20)

class chatPrivateRoom(models.Model):
	created = models.DateTimeField(auto_now_add=True)
	roomMate = models.ForeignKey(chatUser, on_delete=models.CASCADE)
	chatMessages = models.ManyToManyField(chatMessage)

class account(models.Model):
	username = models.CharField(max_length=16)
	password = models.CharField(max_length=200)
	profilPic = models.CharField(max_length=255) 
	email = models.CharField(max_length=200)
	status = models.CharField(max_length=20)
	created = models.DateTimeField(auto_now_add=True)
	updated = models.DateTimeField(auto_now=True)
	privateRooms = models.ManyToManyField(chatPrivateRoom)