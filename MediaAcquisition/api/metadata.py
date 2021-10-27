import json


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

        self._audio_type = None
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


def parseToJson(self):
    return_json = json.dumps(self.__dict__)
    return_json = return_json.replace('"_', '"')
    return return_json


metadata = Metadata()
metadata.name = "My heart will go on"
metadata.artist = "Celine Dion"
metadata.audio_type="mp3"
metadata.audio_id="YT73564856"

print(metadata.name)
print(metadata.artist)

metadata_asJson = parseToJson(metadata)
print(metadata_asJson)
