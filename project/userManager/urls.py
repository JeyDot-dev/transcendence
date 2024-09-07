from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.login_view, name='login'),
	path('signup/', views.signup, name='signup'),
	path('test_token/', views.test_token, name='test_token'),
	path('logout/', views.logout_view, name='logout'),
	path('change_skin/', views.change_skin, name='change_skin'),
	path('change_profile_pic/', views.change_profile_pic, name='change_profile_pic'),
    path('', views.index, name='index')
]
