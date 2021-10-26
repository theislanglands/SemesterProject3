from django.urls import path
from .views import *


urlpatterns = [
    path('dummy/', api_call),
    path('json/<link>/', upload_video)
]

