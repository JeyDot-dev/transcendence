from rest_framework import serializers
from .models import UserInfos

class UserSerializer(serializers.ModelSerializer):
	class Meta(object):
		model = UserInfos
		fields = ['id', 'username', 'email', 'password']

class NewProfilePicSerializer(serializers.ModelSerializer):
	class Meta(object ):
		model = UserInfos
		fields = ['profile_pic']
