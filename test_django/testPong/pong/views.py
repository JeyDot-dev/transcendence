import json
from django.shortcuts import render
from django.http import JsonResponse


# Create your views here.
def home(request):
	return render(request, "home.html")

def pong(request):
	if request.method == 'POST':
		data = json.loads(request.body)
		return JsonResponse({"key": "ok"})
	
	return render(request, "pong.html")