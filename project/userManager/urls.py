from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
	path('signup/', views.signup, name='signup'),
	path('test_token/', views.test_token, name='test_token'),
	path('logout/', views.logout_view, name='logout'),
	path('change_profile_pic/', views.change_profile_pic, name='change_profile_pic'),
	path('change_value/<str:field>/', views.change_value, name='change_value'),
    path('', views.index, name='index')
]
