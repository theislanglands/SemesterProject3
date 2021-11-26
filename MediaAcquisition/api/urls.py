from django.urls import path
from .views import *


urlpatterns = [
    path('dummy/<link>', api_call),
    path('add_youtube/<link>', add_youtube_audio),
    path('delete_track/<link>', delete_audio),
    path('get_track/<link>', get_audio),
    path('get_all_tracks/', get_all_tracks),
    path('get_metadata/<link>', get_metadata),
    path('add_custom', upload_file)
]

