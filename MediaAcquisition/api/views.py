import traceback
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseRedirect
import os
from api.models import *
from api.domain.domainController import domainController
from api.metadata import Metadata
from api.domain.youtubedlp import YoutubeDL
from uuid import uuid4
import json
from django.shortcuts import render
from api.forms import AudioForm
from mutagen.mp3 import MP3


def add_youtube_audio(request, link):
    globalController = domainController()
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

        new_entry = AudioObject(data['audio_id'], data)
        new_entry.save()

        globalController.store_youtube_mp3(link)

        return HttpResponse('New song added to System')
    except Exception:
        return HttpResponseNotFound('There was an error adding the youtube track')


def get_audio(request, link):
    try:
        globalController = domainController()

        return HttpResponse(globalController.get_audio(link))
    except Exception:
        return HttpResponseNotFound('There was an error getting the track')



def get_metadata(request, link):
    try:
        select = link[0:3]
        if select == 'YT_':
            return_meta_data = AudioObject.objects.filter(audio_id=link)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')
            dict = {'audio_id': return_meta_data.values()[0]['audio_id'], 'metadata': return_meta_data.values()[0]['JSON']}
            return JsonResponse(dict)
        elif select == 'CA_':
            return_meta_data = AudioFile.objects.filter(audio_id=link)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')
            dict = {'audio_id': return_meta_data.values()[0]['audio_id'], 'metadata': return_meta_data.values()[0]['JSON']}
            return JsonResponse(dict)
        else:
            return HttpResponse(link + ' not found in database')
    except Exception:
        return HttpResponseNotFound('There was an error getting the metadata')


def add_custom_audio(request):
    globalController = domainController()
    try:
        if request.method == 'POST':
            if not request.FILES['mp3file'] is None:
                #1. use metadaData class to parse dict object to JSON

                formdata = dict(request.POST.items())
                filename = request.FILES['mp3file'].name

                #artwork name
                artwork_filename = request.FILES['artwork'].name

                #artwork url
                artwork_url = globalController.get_artwork_path() + "/" + artwork_filename

                # generating unique id for audio file uuid
                randomuuid = uuid4().hex

                # audio_id
                audio_id = "CA_" + str(randomuuid)

                # changing name of audio file in request name
                request.FILES['mp3file'].name = audio_id + ".mp3"

                # get duration of mp3
                duration = MP3(request.FILES['mp3file']).info.length
                #print(duration)

                # get bitrate of mp3
                bitrate = MP3(request.FILES['mp3file']).info.bitrate / 1000
                data = globalController.get_custom_json(formdata, audio_id, duration, artwork_url, bitrate)

                # TODO refactor temp/temp/temp/temp

                #2. save metadata + artwork + json data + audio id
                instance = AudioFile(artfile=request.FILES['artwork'], audiofile=request.FILES['mp3file'], JSON=data)
                instance.save()

                #3. upload mp3 file to remote file system - how is the id of the custom_track determined?
                globalController.store_custom_mp3( request.FILES['mp3file'].name )
                globalController.store_artwork(request.FILES['artwork'].name)

                return HttpResponse('Successfully uploaded ' + filename + '!')
        else:
            form = AudioForm()
            return render(request, 'form_test.html', {'form': form})
    except Exception:
        return HttpResponse(traceback.format_exc())


def delete_audio(request, link):
    try:
        ##TODO: Fix delete in persistance
        globalController = domainController()
        globalController.delete_audio(link)
        return HttpResponse('succes')

        select = link[0:3]
        if select == 'YT_':
            return_meta_data = AudioObject.objects.filter(audio_id=link)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')

            globalController = domainController()
            globalController.delete_audio(link)

            delete_entry = AudioObject(return_meta_data.values()[0]['audio_id'])
            delete_entry.delete()

            return HttpResponse('File has been deleted')

        elif select == 'CA_':
            return_meta_data = AudioFile.objects.filter(audio_id=link)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')

            globalController = domainController()
            globalController.delete_audio(link)

            delete_entry = AudioFile(return_meta_data.values()[0]['audio_id'])
            delete_entry.delete()

            return HttpResponse('File has been deleted')
        else:
            return HttpResponse(select + ' not found in file system or database')

    except Exception as e:
        return HttpResponse(str(e))


def get_all_tracks(request):
    try:
        YT_entries = list(AudioObject.objects.all())
        CA_entries = list(AudioFile.objects.all())
        data = {}
        tmp = 0
        for x in range(len(YT_entries)):
            data[f'track {tmp}'] = str(YT_entries[x])
            tmp = tmp + 1

        for x in range(len(CA_entries)):
            ##TOdo: make sure there is an audio id when saving custom audio
            data[f'track {tmp}'] = str(CA_entries[x].audio_id)
            tmp = tmp + 1

        return JsonResponse(data)
    except Exception:
        return HttpResponseNotFound(traceback.format_exc())


def youtubegui(request):
    return render(request, 'youtubeUpload.html')


def usergui(request):
    return render(request, 'customUpload.html')


def home(request):
    return render(request, 'index.html')

# docker-compose build
# docker-compose up