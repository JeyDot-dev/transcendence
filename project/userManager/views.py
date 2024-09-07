from django.contrib.auth import login, logout
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes, parser_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .serializers import UserSerializer
from rest_framework.authtoken.models import Token
from .models import UserInfos
from django.shortcuts import get_object_or_404, render

from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

@api_view(['POST'])
def login_view(request):
	print("LOGIN")
	user = get_object_or_404(UserInfos, username=request.data['username'])
	if user.check_password(request.data['password']):
		token, created = Token.objects.get_or_create(user=user)
		login(request, user)
		return Response({'message': 'Login successful', 'token': token.key, 'user': user.to_dict()}, status=status.HTTP_200_OK)
	
	return Response({'message': 'Login failed'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def logout_view(request):
	try:
		request.user.auth_token.delete()
	except:
		pass

	logout(request)

	return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def signup(request):
	print("SIGNUP")
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		user.set_password(request.data['password'])
		user.save()
		token = Token.objects.create(user=user)
		login(request, user)
		return Response({'message': 'User created successfully', 'token': token.key, 'user': user.to_dict()}, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def test_token(request):
	return Response({'message': 'Token is valid'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def change_skin(request):
	user = get_object_or_404(UserInfos, username=request.data.get('username'))
	if not user:
		return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
	user.set_skin(request.data['color'])
	return Response({'message': 'Skin changed successfully'}, status=status.HTTP_200_OK)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
@parser_classes([MultiPartParser, FormParser])
def change_profile_pic(request):
    user = get_object_or_404(UserInfos, username=request.data.get('username'))
    if not user:
        return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if 'profile_pic' not in request.FILES:
        return Response({'message': 'No profile picture provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    user.profile_pic = request.FILES['profile_pic']
    user.save()
    return Response({'message': 'Profile picture changed successfully'}, status=status.HTTP_200_OK)

def index(request):
	return render(request, "index.html", {'user': request.user})