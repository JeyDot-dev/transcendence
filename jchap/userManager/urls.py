from django.urls import path
from . import views

urlpatterns = [
    path('api/ping/', views.ping_pong, name='ping_pong'),
	path('api/login/', views.login, name='login'),
]
