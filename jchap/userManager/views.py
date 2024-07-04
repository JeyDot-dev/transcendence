from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .serializers import UserSerializer
from rest_framework.authtoken.models import Token
from django.contrib.auth.models import User

@api_view(['POST'])
def login(request):
	return Response({'message': 'Hello, world!'}, status=status.HTTP_200_OK)

@api_view(['POST'])
def signup(request):
	print(request.data)
	serializer = UserSerializer(data=request.data)
	if serializer.is_valid():
		user = serializer.save()
		user.set_password(request.data['password'])
		user.save()
		token = Token.objects.create(user=user)

		return Response({'message': 'User created successfully', 'token': token.key, 'user': serializer.data}, status=status.HTTP_201_CREATED)
	return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def test_token(request):
	return Response({'message': 'Hello, world!'}, status=status.HTTP_200_OK)