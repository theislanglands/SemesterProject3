import json
from datetime import datetime
from uuid import uuid4
from django.template.defaultfilters import slugify

class Metadata:
    def __init__(self):
        self._audio_id = None
        self._name = None
        self._artist = None
        self._duration = None
        self._release_year = None
        self._artwork = None

        self._collection = False
        self._collection_name = None
        self._track_nr = None
        self._total_track_count = None

        self._audio_type = "mp3"
        self._bitrate = None

        self._created_at = None
        self._updated_at = None

    @property
    def audio_id(self):
        return self._audio_id

    @audio_id.setter
    def audio_id(self, audio_id):
        self._audio_id = audio_id

    @property
    def name(self):
        return self._name

    @name.setter
    def name(self, name):
        self._name = name

    @property
    def artist(self):
        return self._artist

    @artist.setter
    def artist(self, artist):
        self._artist = artist

    @property
    def duration(self):
        return self._duration

    @duration.setter
    def duration(self, duration):
        self._duration = duration

    @property
    def release_year(self):
        return self._release_year

    @release_year.setter
    def release_year(self, release_year):
        self._release_year = release_year

    @property
    def artwork(self):
        return self._artwork

    @artwork.setter
    def artwork(self, artwork):
        self._artwork = artwork

    @property
    def collection(self):
        return self._collection

    @collection.setter
    def collection(self, collection):
        self._collection = collection

    @property
    def collection_name(self):
        return self._collection_name

    @collection_name.setter
    def collection_name(self, collection_name):
        self._collection_name = collection_name

    @property
    def track_nr(self):
        return self._track_nr

    @track_nr.setter
    def track_nr(self, track_nr):
        self._track_nr = track_nr

    @property
    def total_track_count(self):
        return self._total_track_count

    @total_track_count.setter
    def total_track_count(self, total_track_count):
        self._total_track_count = total_track_count

    @property
    def audio_type(self):
        return self._audio_type

    @audio_type.setter
    def audio_type(self, audio_type):
        self._audio_type = audio_type

    @property
    def bitrate(self):
        return self._bitrate

    @bitrate.setter
    def bitrate(self, bitrate):
        self._bitrate = bitrate

    @property
    def created_at(self):
        return self._created_at

    @created_at.setter
    def created_at(self, created_at):
        self._created_at = created_at

    @property
    def updated_at(self):
        return self._updated_at

    @updated_at.setter
    def updated_at(self, updated_at):
        self._updated_at = updated_at

    def sort_meta_data(self, data):
        # if no track in json - use video title & uploader

        print(str(data))

        if 'track' in data:
            self.name = data["track"]
        else:
            self.name = data['title']

        if 'artist' in data:
            self.artist = data['artist']
        else:
            self.artist = data['uploader']

        if 'album' in data:
            self.collection = True
            self.collection_name = data['album']

        self.duration = data['duration']
        self.release_year = data['upload_date']
        self.artwork = data['thumbnail']
        self.created_at = str(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

        return self.parse_to_json(self)


    def __str__(self):
        return "audio_id: " + self.audio_id + \
               "\nname: " + self.name + \
               "\nartist: " + self.artist + \
               "\nduration: " + str(self.duration) + \
               "\nrelease year " + str(self._release_year) +\
               "\nartwork link " + str(self.artwork) + \
               "\npart of collection " + str(self.collection) + \
               "\ncollection name: " + str(self.collection_name) +\
                "\ntrack " + str(self.track_nr) + " of " + str(self.total_track_count) +\
                "\naudio type: " + self.audio_type +\
                "\nbitrate " + str(self.bitrate) + \
                "\ncreated at " + str(self.created_at) + \
                "\nupdated at " + str(self.updated_at)

    def parse_to_json(self):
        return_json = json.dumps(self.__dict__)
        #TODO deal med danske bogstaver!
        return_json = return_json.replace('"_', '"') #fjerner underscore fra variable navne
        return return_json

    def parse_from_youtube_json(self, data):
        # creating empty metadata object
        metadata = Metadata()

        # adding data from youtube json to metadata object
        metadata.audio_id = "YT_"+str(data['id'])

        # if no track in json - use video title & uploader
        if 'track' in data:
            metadata.name = data["track"]
        else:
            metadata.name = data['title']

        if 'artist' in data:
            metadata.artist = data['artist']
        else:
            metadata.artist = data['uploader']

        if 'album' in data:
            metadata.collection = True
            metadata.collection_name = data['album']

        metadata.duration = data['duration']
        metadata.release_year = data['upload_date']
        metadata.artwork = data['thumbnail']
        metadata.created_at = str(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

        #print(metadata)

        return metadata.parse_to_json()

    def parse_from_custom_audio_json(self, json_formdata, audio_id, duration, artwork_url, bitrate):
        # creating empty metadata object
        metadata = Metadata()
        #print("in parse from custom method")
        #print(str(json_formdata))
        #convert json_formdata to dict
        data = json.loads(json_formdata)
        metadata.audio_id = audio_id
        metadata.name = data['name']
        metadata.artist = data['artist']

        # check if collection
        if data['part of collection']:
            metadata.collection = True
            metadata.collection_name = data['collection_name']
            metadata.track_nr = data['track_nr']
            metadata.total_track_count = data['total_track_count']

        metadata.duration = duration
        metadata.release_year = data['release_year']
        metadata.artwork = artwork_url
        metadata.bitrate = bitrate
        metadata.created_at = str(datetime.now().strftime("%d/%m/%Y %H:%M:%S"))

        #print(str(metadata.parse_to_json()))

        return metadata.parse_to_json()

if __name__ == '__main__':
    parser = Metadata()
    metadata_test = '{"name": "My Heart Will Go On", "artist": "Celine Dion", "is_collection": "true", "collection_name": "New York World Tour", "track_nr": "1", "total_track_count": "5", "release_year": "1992", "path_to_artwork": "https:/forbkbksdf"}'
    print(parser.parse_from_custom_audio_json(metadata_test))




