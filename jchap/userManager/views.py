from django.shortcuts import render
from django.http import HttpResponse

def ping_pong(request):
	if request.method == 'GET':
		return HttpResponse('pong')
	else:
		return HttpResponse('Method not allowed', status=405)

def login(request):
	if request.method == 'POST':
		print(request.POST.get('username'))
		print(request.POST.get('password'))
		return HttpResponse("connected")
	else:
		return HttpResponse('Method not allowed', status=405)