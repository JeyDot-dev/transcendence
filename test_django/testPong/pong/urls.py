from django.urls import path
from . import views

urlpatterns = [
	path("", views.home, name="home"),
	path("pong/", views.pong, name="pong"),
	path("chat/", views.chat, name="chat")
]