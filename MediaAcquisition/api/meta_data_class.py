class metaData():

    #basic audio info
    audio_id = None
    name = None
    artist = None
    duration = None
    release_year = None
    artwork = None

    #collection
    collection = False
    track_nr = None
    total_track_count = None

    #fileproperties
    audio_type = None
    bitrate = None

    #timestamps
    created_at = None
    updated_at = None


    # setter methods
    def set_audio_id(self, audioId):
        self.audioId = audioId

    def set_name(self, name):
        self.name = name

    def set_artist(self, artist):
        self.artist = artist

    def set_duration(self, duration):
        self.duration = duration

    def set_release_year(self, release_year):
        self.release_year = release_year

    def set_artwork(self, artwork):
        self.artwork = artwork

    def set_collection(self, collection):
        self.collection = collection

    def set_track_nr(self, track_nr):
        self.track_nr = track_nr

    def set_total_track_count(self, total_track_count):
        self.total_track_count = total_track_count

    def set_audio_type(self, audio_type):
        self.audio_type = audio_type

    def set_bitrate(self, bitrate):
        self.bitrate = bitrate

    def set_created_at(self, created_at):
        self.created_at = created_at

    def set_updated_at(self, updated_at):
        self.updated_at = updated_at