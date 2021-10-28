import sys
import traceback

from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from api.models import Metadata
from api.domain.youtubedlp import YoutubeDL
from api.metadata import Metadata
import requests
import yt_dlp



# Create your views here.



def api_call(request, link):
    message = 'this is a dummy message'

    try:
        y = YoutubeDL()
        data = y.get_json(link)
        return JsonResponse(data)
    except Exception:
        return HttpResponse(traceback.format_exc() + '   ' + str(link))



    try:
        meta_data = Metadata.objects.filter(audio_id=link)
        if meta_data.exists:
            id = meta_data.values()[0]['audio_id']
            return HttpResponseNotFound(id + ' is already in database')
        try:
            youtubeDL = YoutubeDL()
            youtubeDL.get_json(link)
        except Exception as e:
            return HttpResponse (str(e.__cause__))
    except Exception as e:
        return HttpResponse('not found. ' + str(e))




def add_youtube_audio(request, link):
    #PSEUDO recipe
    #check if link already in database - if true return error msg
    try:
        return_meta_data = Metadata.objects.filter(audio_id=link)
        if return_meta_data.exists:
            id = return_meta_data.values()[0]['audio_id']
            return HttpResponseNotFound(id + ' is already in database')
        else:
            try:

                y = YoutubeDL()
                data = y.get_json(link)
                name = data['name']
                artist = data['artist']
                id = data['audio_id']
                new_entry = Metadata(id, name, artist)
                new_entry.save()
                return HttpResponse('du er et fgt')
            except Exception:
                return HttpResponse(traceback.format_exc() + '   ' + str(link))
    except Exception as e:
        return HttpResponse(str(e.__cause__))
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


