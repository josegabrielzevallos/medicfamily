from django.urls import path
from .views import register, custom_login, google_login, custom_refresh_token

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', custom_login, name='custom_login'),
    path('google-login/', google_login, name='google_login'),
    path('refresh-token/', custom_refresh_token, name='refresh_token'),
]
