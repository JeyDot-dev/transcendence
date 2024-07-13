from django.shortcuts import render

def index(request):
    return render(request, 'base.html')

def home(request):
    return render(request, 'home.html')

def about(request):
    return render(request, 'about.html')

def test(request):
    return render(request, 'test.html')
