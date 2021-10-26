from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
import requests
import yt_dlp



# Create your views here.

ydl_opts = {
        'format': 'bestaudio/best',
        'writeinfojson': True,
        'clean_infojson': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',

        }], }



def api_call(request):
    message = 'this is a dummy message'
    return JsonResponse(message, safe=False)

def upload_video(request, link):
    #PSEUDO recipe
    #check if link already in database - if true return error msg
    #download ONLY JSON data without MP3.
    #check JSON data if video exceeds limit of 128 gb - if true return error msg
    #download video to filesystem
    #send metadata to meta data team.
    #return 200 code succes
    #

    return JsonResponse(str(link), safe=False)
    #
    #with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    #    response = ydl.extract_info(link)
    #    return JsonResponse(response['title'])

def send_meta(data):
    pass
