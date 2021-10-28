from django.urls import path
from .views import *


urlpatterns = [
    path('dummy/<link>', api_call),
    path('json/<link>/', add_youtube_audio),
]

