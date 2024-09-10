from django.shortcuts import render

def index(request):
	return render(request, 'base.html')

def home_content(request):
	return render(request, 'home.html')

def game_content(request):
	return render(request, 'game.html')

def about_content(request):
	return render(request, 'about.html')

def test_content(request):
	return render(request, 'test.html')

def default_content(request):
    reponse = home_content(request)
    reponse['X-Default-View'] = 'True'
    return reponse
