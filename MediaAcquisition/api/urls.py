from django.urls import path
from .views import *


urlpatterns = [
    path('dummy/<link>', api_call),
    path('add_track/<link>', add_youtube_audio),
    path('delete_track/<link>', delete_audio),
    path('get_track/<link>', get_audio),
    path('get_all_tracks/', get_all_tracks)
]

