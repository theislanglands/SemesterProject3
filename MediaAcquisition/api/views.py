import traceback
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from api.models import AudioObject
from api.domain.youtubedlp import YoutubeDL
import requests
import yt_dlp
import json
from api.metadata import Metadata


# todo: Add sorting at metadata object
# todo: Refactor APIviews


# this is a test don't use it
def api_call(request, link):
    message = 'this is a dummy message'
    try:
        y = YoutubeDL()
        data = y.get_json(link)
        return JsonResponse(data)
    except Exception:
        return HttpResponse(traceback.format_exc() + '   ' + str(link))




def add_youtube_audio(request, link):
    # check if link already in database
    try:
        return_meta_data = AudioObject.objects.filter(audio_id=link)
        if return_meta_data:
            id = return_meta_data.values()[0]['audio_id']
            return HttpResponseNotFound('Song already in database')
        else:
            # download youtubeJSON data
            y = YoutubeDL()
            data = y.get_json(link)
            if data == None:
                return HttpResponseNotFound('URL is not a valid youtube link')
            # checks wether filesize is larger that 128 GB
            filesize = data["filesize"]
            if filesize > 137438953472: # 128 GB is bytes
                return HttpResponse('Filesize exceeds the 128 GB limit')


            new_entry = AudioObject(data['id'], data)
            new_entry.save()
            return HttpResponse('New song added to database')

    except Exception:
        return HttpResponse(traceback.format_exc())



def get_audio(request, link):
    try:
        return_meta_data = AudioObject.objects.filter(audio_id=link)
        if not return_meta_data:
            return HttpResponseNotFound('does not exist in the database')
        else:
            dict = {'audio_id': return_meta_data.values()[0]['audio_id'], 'metadata': return_meta_data.values()[0]['JSON']}
            return JsonResponse(dict)
    except Exception:
        return HttpResponse(traceback.format_exc())
    pass


def add_local_audio(request):
    pass


def delete_audio(request, link):
    try:
        return_meta_data = AudioObject.objects.filter(audio_id=link)
        if not return_meta_data:
            return HttpResponseNotFound('Song ID not found in database')
        else:
                id = return_meta_data.values()[0]['audio_id']
                delete_entry = AudioObject(id)
                delete_entry.delete()
                return HttpResponse('File has been deleted')
    except Exception:
        return HttpResponse(traceback.format_exc())


