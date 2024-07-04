from django.shortcuts import render

# Create your views here.

def index(request):
	return render(request, 'index.html')

def signup(request):
	if request.method == 'POST':
		username = request.POST['username']
		password = request.POST['password']
		email = request.POST['email']
		return render(request, 'signup.html', {'username': username, 'password': password, 'email': email})