from django.urls import path
from . import views

urlpatterns = [
    path('42/login/', views.fortytwo_login, name='fortytwo-login'),
    path('42/callback/', views.fortytwo_callback, name='fortytwo-callback'),
    path('me/', views.me, name='me'),
]


