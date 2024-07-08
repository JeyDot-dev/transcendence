from django.shortcuts import render, redirect
from rest_framework import viewsets
from .models import Score
from .serializers import ScoreSerializer


class ScoreViewSet(viewsets.ModelViewSet):
    queryset = Score.objects.all()
    serializer_class = ScoreSerializer


def index(request):
    return render(request, "pong3d/index.html")
