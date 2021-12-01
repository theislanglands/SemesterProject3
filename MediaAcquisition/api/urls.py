from django.urls import path
from .views import *

urlpatterns = [
    path('dummy/<link>', api_call, name='dummy'),
    path('add_youtube/<link>', add_youtube_audio, name='add_yt'),
    path('delete_track/<link>', delete_audio, name='delete_track'),
    path('get_track/<link>', get_audio, name='get_track'),
    path('get_all_tracks/', get_all_tracks, name='get_all_tracks'),
    path('get_metadata/<link>', get_metadata, name='get_metadata'),
    path('add_custom', upload_file, name='add_custom')
]

