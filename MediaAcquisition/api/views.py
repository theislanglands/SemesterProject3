import traceback
from django.shortcuts import render
from django.http import HttpResponse, JsonResponse, HttpResponseNotFound, HttpResponseRedirect
import os
from api.models import *
from api.domain.domainController import domainController
from api import Metadata
from api.domain.youtubedlp import YoutubeDL
from uuid import uuid4
import json
from django.shortcuts import render
from api.forms import AudioForm
from mutagen.mp3 import MP3



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
    globalController = domainController()

    try:
        if request.method == 'POST':
            if not request.FILES['mp3file'] is None:
                #1. use metadaData class to parse dict object to JSON

                data = dict(request.POST.items())

                filename = request.FILES['mp3file'].name

                # remove .mp3
                filename = filename[:-4]

                # uuid
                randomuuid = uuid4().hex

                #audio_id
                audio_id = "CA_" + str(randomuuid)

                #artwork_id
                artwork_filename = request.FILES['artwork'].name

                #artwork url
                artwork_url = globalController.get_artwork_path() + "/" + artwork_filename

                # change request name
                request.FILES['mp3file'].name = audio_id + ".mp3"

                # get duration of mp3
                duration = MP3(request.FILES['mp3file']).info.length
                print(duration)
                exit()

                # get bitrate of mp3
                bitrate = MP3(request.FILES['mp3file']).info.bitrate / 1000

                #creating metadata object
                metadata = Metadata()


                #modify metadata fra form så det har samme format som youtube
                #audio_id - skal tilføjes
                #name - OK
                #artist - OK
                #duration - virker (måske) skal lige testes
                #release_year - OK
                #artwork - url/artwork/filename

                #collection:
                #collection_name
                #track_nr
                #total_track_count

                #audio_type = "mp3" - OK
                #bitrate: virker (måske) skal lige testes

                #created_at = MANGLER
                #updated_at: null



                #TODO
                # redigere metadata - så der bliver tilføjet duration, etc inden den bliver lagret i vores db
                # dvs kør igennem metode i metadata klassen!
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
        select = link[0:2]
        if select == 'YT_':
            query = 'YT_' + link
            return_meta_data = AudioObject.objects.filter(audio_id=query)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')
            id = return_meta_data.values()[0]['audio_id']
            delete_entry = AudioObject(id)
            delete_entry.delete()
            return HttpResponse('File has been deleted')

        elif select == 'CA_':
            ##Delete audio from DB
            query = 'CA_' + link
            return_meta_data = AudioFile.objects.filter(audio_id=query)
            if not return_meta_data:
                return HttpResponseNotFound('Song URL invalid OR not in database')
            id = return_meta_data.values()[0]['audio_id']
            delete_entry = AudioFile(id)
            delete_entry.delete()

            ##delete file from filesystem
            globalController = domainController()
            globalController.delete_audio(id)

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


