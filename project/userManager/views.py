from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.decorators import (
	api_view,
	permission_classes,
	authentication_classes,
	parser_classes,
)
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import UserSerializer
from rest_framework.authtoken.models import Token
from .models import UserInfos
from django.shortcuts import get_object_or_404, render

from PIL import Image
import os
import uuid
from django.conf import settings
import os
import uuid
from django.conf import settings

from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

@api_view(["POST"])
def login_view(request):
	user = get_object_or_404(UserInfos, username=request.data["username"])
	if user.check_password(request.data["password"]):
		token, created = Token.objects.get_or_create(user=user)
		login(request, user)
		user.set_online(True)
		return Response(
			{"message": "Login successful", "token": token.key, "user": user.to_dict()},
			status=status.HTTP_200_OK,
		)
	request.user.set_online(False)
	return Response({"message": "Login failed"}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def logout_view(request):
	request.user.set_online(False)
	try:
		request.user.auth_token.delete()
	except:
		return Response({'message': 'Logout failed'}, status=status.HTTP_400_BAD_REQUEST)
	logout(request)
	return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(["POST"])
def signup(request):
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		if len(request.data["username"]) < 3:
			return Response(
				{"message": "Username must be at least 3 characters long"},
				status=status.HTTP_400_BAD_REQUEST,
			)
		if not check_characters(request.data['password'], 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*()'):
			return Response({'message': 'Invalid characters in password'}, status=status.HTTP_400_BAD_REQUEST)
		if len(request.data['password']) < 8:
			return Response({'message': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
		if not contains_special_characters(request.data['password'], '!@#_-'):
			return Response({'message': 'Password must contain at least one of the following characters: !@#_-'}, status=status.HTTP_400_BAD_REQUEST)

		user = serializer.save()
		if len(request.data["username"]) < 2:
			return Response(
				{"message": "Username must be at least 3 characters long"},
				status=status.HTTP_400_BAD_REQUEST,
			)
		user.set_password(request.data["password"])
		user.save()
		token = Token.objects.create(user=user)
		login(request, user)
		return Response(
			{
				"message": "User created successfully",
				"token": token.key,
				"user": user.to_dict(),
			},
			status=status.HTTP_201_CREATED,
		)
	error_messages = " ".join(
		[f"{field}: {error[0]}" for field, error in serializer.errors.items()]
	)
	return Response({"message": error_messages}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def test_token(request):
	return Response({"message": "Token is valid"})


# ==========================
#		 USER VIEWS
# ==========================

# ALL USER RELATED VIEWS LIKE PROFILE, FRIENDS, ETC. GO HERE

@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@parser_classes([MultiPartParser, FormParser])
def change_profile_pic(request):
	user = get_object_or_404(UserInfos, username=request.data.get("username"))
	if not user:
		return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

	if "profile_pic" not in request.FILES:
		return Response(
			{"message": "No profile picture provided"},
			status=status.HTTP_400_BAD_REQUEST,
		)

	try:
		Image.open(request.FILES["profile_pic"])
	except IOError:
		if hasattr(request.FILES["profile_pic"], 'temporary_file_path'):
			os.remove(request.FILES["profile_pic"].temporary_file_path())  # Delete the file
		return Response(
			{"message": "Uploaded file is not a valid image"},
			status=status.HTTP_400_BAD_REQUEST,
		)

	file_extension = os.path.splitext(request.FILES["profile_pic"].name)[1]
	new_filename = str(uuid.uuid4()) + file_extension

	while os.path.exists(os.path.join(settings.MEDIA_ROOT, new_filename)):
		new_filename = str(uuid.uuid4()) + file_extension

	request.FILES["profile_pic"].name = new_filename
	file_extension = os.path.splitext(request.FILES["profile_pic"].name)[1]
	new_filename = str(uuid.uuid4()) + file_extension

	while os.path.exists(os.path.join(settings.MEDIA_ROOT, new_filename)):
		new_filename = str(uuid.uuid4()) + file_extension

	request.FILES["profile_pic"].name = new_filename
	user.profile_pic = request.FILES["profile_pic"]
	user.save()
	return Response(
		{"message": "Profile picture changed successfully"}, status=status.HTTP_200_OK
	)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def change_value(request, field):
	user = get_object_or_404(UserInfos, username=request.data.get("username"))
	if not user:
		return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

	try:
		if field == "new_username":
			if not check_characters(str=request.data['new_value'], allowed_characters='abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_'):
				return Response({'message': 'Invalid characters in username'}, status=status.HTTP_400_BAD_REQUEST)
			user.set_username(request.data["new_value"])
		elif field == "new_email":
			user.set_email(request.data["new_value"])
		elif field == "new_password":
			if user.username != request.user.username:
				return Response({'message': 'You can only change your own password'}, status=status.HTTP_400_BAD_REQUEST)
			if not check_characters(request.data['new_value'], 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_!@#$%^&*()'):
				return Response({'message': 'Invalid characters in password'}, status=status.HTTP_400_BAD_REQUEST)
			if len(request.data['new_value']) < 8:
				return Response({'message': 'Password must be at least 8 characters long'}, status=status.HTTP_400_BAD_REQUEST)
			if not contains_special_characters(request.data['new_value'], '!@#_-'):
				return Response({'message': 'Password must contain at least one of the following characters: !@#_-'}, status=status.HTTP_400_BAD_REQUEST)
			user.set_password(request.data['new_value'])
			user.save()
		elif field == "new_status":
			if not check_characters(request.data['new_value'], 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789éàèöäü_!@#$%^&*() '):
				return Response({'message': 'Invalid characters in status'}, status=status.HTTP_400_BAD_REQUEST)
			user.set_status(request.data["new_value"])
		elif field == "set_online":
			user.set_online(request.data["new_value"])
		elif field == "set_playing":
			user.set_playing(request.data["new_value"])
		elif field == "set_grade":
			user.set_grade(request.data["new_value"])
		elif field == "set_total_games":
			user.set_total_games(request.data["new_value"])
		elif field == "set_total_victories":
			user.set_total_victories(request.data["new_value"])
		elif field == "set_skin":
			user.set_skin(request.data["new_value"])
		elif field == "add_friend":
			user.add_friend(request.data["new_value"])
		elif field == "accept_friend_request":
			user.accept_friend_request(request.data["new_value"])
		elif field == "deny_friend_request":
			user.deny_friend_request(request.data["new_value"])
		elif field == "remove_friend":
			user.remove_friend(request.data["new_value"])
		else:
			return Response({"message": "Field not found"}, status=status.HTTP_404_NOT_FOUND)

		return Response({"message": field + " changed successfully"}, status=status.HTTP_200_OK)
	except Exception as e:
		return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def get_user_list(request):
	if searchTerm := request.GET.get("searchTerm", ""):
		users = UserInfos.objects.filter(username__icontains=searchTerm)
	else:
		users = UserInfos.objects.all()
	users_list = [user.to_dict_public() for user in users]
	return Response({"users": users_list}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def get_user(request, field):
	user = get_object_or_404(UserInfos, username=field)
	if not user:
		return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
	return Response({'user': user.to_dict_public()}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def get_user(request, field):
	user = get_object_or_404(UserInfos, username=field)
	if not user:
		return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
	return Response({'user': user.to_dict_public()}, status=status.HTTP_200_OK)

# ==========================
#		 HTML VIEWS
# ==========================

# ALL HTML VIEWS GO HERE


def index(request):
	user = request.user
	ten_games = []

	if user.is_authenticated:
		ten_games = user.match_history.all().order_by("-date")[:10]
		user.set_total_games(user.match_history.all().count())
		victories = sum(
			1 for game in user.match_history.all() if game.winner.name == user.username
		)
		user.set_total_victories(victories)

	return render(request, "index.html", {"user": user, "game_history": ten_games})

def profile(request, username):
	user = get_object_or_404(UserInfos, username=username)
	return render(request, "profile.html", {"user": user})

def check_characters(str, allowed_characters): # Check if a string contains only allowed characters returns True if it does, False otherwise
	return all(char in allowed_characters for char in str)

def contains_special_characters(password, special_characters): # Check if a string contains at least one special character
	return any(char in special_characters for char in password)