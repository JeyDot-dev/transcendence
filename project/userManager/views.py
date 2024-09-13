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

from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import TokenAuthentication, SessionAuthentication

import logging

logger = logging.getLogger(__name__)

# ==========================
#         AUTH VIEWS
# ==========================


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
    try:
        request.user.auth_token.delete()
    except:
        pass

    logout(request)

    return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)


@api_view(["POST"])
def signup(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
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
#         USER VIEWS
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

    user.profile_pic = request.FILES["profile_pic"]
    user.save()
    return Response(
        {"message": "Profile picture changed successfully"}, status=status.HTTP_200_OK
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication, SessionAuthentication])
def change_value(request, field):
    logger.info(f"Changing {field} for user {request.user.username}")
    user = get_object_or_404(UserInfos, username=request.data.get("username"))
    if not user:
        return Response({"message": "User not found"}, status=status.HTTP_404_NOT_FOUND)

    if field == "new_username":
        user.set_username(request.data["new_value"])
    elif field == "new_email":
        user.set_email(request.data["new_value"])
    elif field == "new_password":
        user.set_password(request.data["new_value"])
        logout(request)
    elif field == "new_status":
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
        try:
            user.add_friend(request.data["new_value"])
        except:
            return Response(
                {"message": "Friend not found"}, status=status.HTTP_404_NOT_FOUND
            )
    else:
        return Response(
            {"message": "Field not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {"message": field + " changed successfully"}, status=status.HTTP_200_OK
    )


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


# ==========================
#         HTML VIEWS
# ==========================

# ALL HTML VIEWS GO HERE


def index(request):
    return render(request, "index.html", {"user": request.user})
