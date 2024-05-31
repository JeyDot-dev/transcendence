import json
from django.shortcuts import render
from django.http import JsonResponse
from .models import chatMessage, chatUser, chatPrivateRoom, account


# Create your views here.
def home(request):
	return render(request, "home.html")

def pong(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		return JsonResponse({"key": "ok"})
	
	return render(request, "pong.html")

def chat(request):
	accounts = account.objects.create(
		username="test",
		password="test",
		profilPic="https://media.4-paws.org/1/2/6/0/1260b8bbeb9d82d5a6caaa078d5061bbf626f94e/VIER%20PFOTEN_2015-04-27_010-1927x1333-1920x1328.jpg",
		email="test",
		status="en ligne"
	)
	cc = chatUser.objects.create(
		username="test2",
		profilPic="https://media.4-paws.org/1/2/6/0/1260b8bbeb9d82d5a6caaa078d5061bbf626f94e/VIER%20PFOTEN_2015-04-27_010-1927x1333-1920x1328.jpg",
		status="en ligne"
	)
	cpr = chatPrivateRoom.objects.create(
		roomMate = cc
	)
	cm = chatMessage.objects.create(
		message="test4",
		sender="test2"
	)
	cpr.chatMessages.add(cm)
	accounts.privateRooms.add(cpr)

	return render(request, "chat-list.html", {"chatMessages": accounts.privateRooms.first()})