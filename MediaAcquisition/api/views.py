import traceback
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseRedirect
import os
from api.domain.domainController import domainController
from api.models import *
from api.domain.youtubedlp import YoutubeDL

import json
from django.shortcuts import render
from api.forms import AudioForm


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

    globalController = domainController()
    # check if link already in database
    try:
        query = 'YT_' + link
        return_meta_data = AudioObject.objects.filter(audio_id=query)
        if return_meta_data:
            return HttpResponseNotFound('Song already in database')

        #Download Metadata and sort it
        data = globalController.get_json(link)

        if data == None:
            return HttpResponseNotFound('URL not valid')

        data = json.loads(data)

        #check filesize before upload
        new_entry = AudioObject(data['audio_id'], data)
        new_entry.save()

        globalController.store_youtube_mp3(link)


        return HttpResponse('New song added to database')

    except Exception:
        return HttpResponse(traceback.format_exc())


def get_audio(request, link):
    globalController = domainController()

    return HttpResponse(globalController.get_audio(link))

def get_metadata(request, link):
    globalController = domainController()

    # returns metadata from django db
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

def upload_file(request):
    try:
        if request.method == 'POST':
            if not request.FILES['mp3file'] is None:
                #1. use metadaData class to parse dict object to JSON

                data = dict(request.POST.items())

                #2. extract size of audiofile, BUT WAIT! wouldn't it be better to check
                # file size on front end to avoid large files being transfered to the webserver.

                #2. save metadata + artwork + json data + audio id
                instance = AudioFile(artfile=request.FILES['artwork'], audiofile=request.FILES['mp3file'], JSON=data)
                instance.save()

                filename = request.FILES['mp3file'].filename
                print(filename);

                #3. upload mp3 file to remote file system - how is the id of the custom_track determined?
                globalController = domainController()
                globalController.store_custom_mp3('MediaAcquisition/media/temp/*.mp3')

                return HttpResponse(request.POST['metadata'] + ' uploaded')
        else:
            form = AudioForm()
        return render(request, 'form_test.html', {'form': form})
    except Exception:
        return HttpResponse(traceback.format_exc())


def delete_audio(request, link):
    try:
        query = 'YT_' + link
        return_meta_data = AudioObject.objects.filter(audio_id=query)
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
            data[f'track {tmp}'] = str(all_entries[x])
            tmp = tmp + 1
        if all_entries:
            return JsonResponse(data)
        else:
            return HttpResponse('no entries in database')
    except Exception:
        return HttpResponseNotFound(traceback.format_exc())

def youtubegui(request):
    return render(request, 'youtubeUpload.html')

def usergui(request):
    return render(request, 'customUpload.html')

def home(request):
    return render(request, 'index.html')


def add_cu(request):

    json = request.POST.get("metadata")
    artfile = request.FILES.get("artwork")
    audiofile = request.FILES.get("mp3file")

    return HttpResponse("recieved " + str(json))


