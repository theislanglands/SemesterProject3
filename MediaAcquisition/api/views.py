import sys
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

# Create your views here.


# this is a test class, don't use it
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
            return HttpResponse(str(e.__cause__))
    except Exception as e:
        return HttpResponse('not found. ' + str(e))


def add_youtube_audio(request, link):
    # check if link already in database
    try:
        return_meta_data = AudioObject.objects.filter(audio_id=link)

        if return_meta_data:
            id = return_meta_data.values()[0]['audio_id']
            return HttpResponseNotFound(id + ' is already in database')
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
            return HttpResponse('New track URL added to database')

    except Exception:
        return HttpResponse(traceback.format_exc())
    # check if link already in database - if true return error msg
    # download ONLY JSON data without MP3.
    # check JSON data if video exceeds limit of 128 gb - if true return error msg
    # download video to filesystem
    # send metadata to meta data team.
    # Retry if fail
    # return 200 code succes
    #
    return JsonResponse(str(link), safe=False)


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
        if return_meta_data:
            return HttpResponseNotFound('Song ID not found in database')
        else:
            try:
                id = return_meta_data.values()[0]['audio_id']
                delete_entry = AudioObject(id)
                delete_entry.delete()
                return HttpResponse('File has been deleted')
            except Exception:
                return HttpResponse(traceback.format_exc() + '   ' + str(link))
    except Exception:
        return HttpResponse(traceback.format_exc())


#Todo: Refactor VIews.py