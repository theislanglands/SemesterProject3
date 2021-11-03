import traceback
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from api.models import AudioObject
from api.domain.youtubedlp import YoutubeDL
import requests
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
            return HttpResponseNotFound('Song already in database')

        #Download Metadata and sort it
        data = globalController.get_json(link)
        data = json.loads(data)
        if data == None:
            return HttpResponseNotFound('URL not valid')
        #check filesize before upload
        new_entry = AudioObject(data['audio_id'], data)
        new_entry.save()

        #start new thread
        #Run store_youtube_mp3
        #Catch return message
        domainController.store_youtube_mp3(link)


        return HttpResponse('New song added to database')

    except Exception:
        return HttpResponse(traceback.format_exc())



def get_audio(request, link):
    try:
        return_meta_data = AudioObject.objects.filter(audio_id=link)
        if not return_meta_data:
            return HttpResponseNotFound('Song URL invalid OR not in database')
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
            return HttpResponseNotFound('Song URL invalid OR not in database')
        else:
                id = return_meta_data.values()[0]['audio_id']
                delete_entry = AudioObject(id)
                delete_entry.delete()
                return HttpResponse('File has been deleted')
    except Exception:
        return HttpResponse(traceback.format_exc())


def get_all_tracks(request):
    try:
        all_entries = list(AudioObject.objects.all())
        data = {}
        tmp = 0
        print(all_entries)
        for x in range(len(all_entries)):
            print(tmp)
            data[f'track {tmp}'] = str(all_entries[x])
            tmp = tmp + 1
        print(data)
        print(type(data['track 1']))

        if all_entries:
            return JsonResponse(data)
        else:
            return HttpResponse('no entries in database')
    except Exception:
        return HttpResponseNotFound(traceback.format_exc())

