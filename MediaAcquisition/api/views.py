from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
import requests
import yt_dlp



# Create your views here.



def api_call(request):
    message = 'this is a dummy message'
    return JsonResponse(message, safe=False)


def add_youtube_audio(request, link):
    #PSEUDO recipe
    #check if link already in database - if true return error msg
    #download ONLY JSON data without MP3.
    #check JSON data if video exceeds limit of 128 gb - if true return error msg
    #download video to filesystem
    #send metadata to meta data team.
    #Retry if fail
    #return 200 code succes
    #
    return JsonResponse(str(link), safe=False)


def get_audio(request, id):
    pass


def add_custom_audio(request):
    pass


def delete_audio(request, id):
    pass