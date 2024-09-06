"""
URL configuration for transcendence project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path, re_path
from . import views

urlpatterns = [
    path('admin', admin.site.urls),
    path("api/home//", views.home_content, name="home_content"),
    # path("api/pong//", include("database.urls")),
    path("api/pong/", include("pong.urls")),
    path("api/userManager/", include("userManager.urls")),
    path("api/database/", include("database.urls")),
    path("api/about/", views.about_content, name="about_content"),
    path("api/test/", views.test_content, name="test_content"),
    re_path(r"^api/.*$", views.home_content),
    re_path(r"^.*$", views.index, name="index"),
]
