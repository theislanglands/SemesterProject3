from audioManager.custom_audio_controller import CustomAudio
from audioManager.ytdlcontroller import YoutubeAudioDL
from api.persistence.persistenceController import PersistanceController

class domainController:
    def __init__(self):
        self.yt_download = YoutubeAudioDL()
        self.persistance = PersistanceController()
        self.custom_audio = CustomAudio()

    def get_json(self, youtube_id):
        return self.yt_download.get_json(youtube_id)

    def store_youtube_mp3(self, youtube_id):
        return self.yt_download.store_mp3(youtube_id)

    def store_custom_mp3(self, audio_mp3):
        success = self.custom_audio.store_mp3(audio_mp3)
        return success

    def store_artwork(self, filepath):
        success = self.custom_audio.storeArtwork(filepath)
        return success

    def get_audio(self, id):
        return self.persistance.getAudio(id)

    def delete_audio(self, id):
        return self.persistance.delete_audio(id)

    def post_metadata(self, metadata_json, endpoint_url):
        return self.custom_audio.post_metadata(self, metadata_json, endpoint_url)

    def get_artwork_path(self):
        domain = self.persistance.domain
        root = self.persistance.root
        artwork_root = self.persistance.artworkroot
        artwork_url = domain + "/" + root + "/" + artwork_root
        return artwork_url

    def get_custom_json(self, data, audio_id, duration, artwork_url, bitrate):
        return self.custom_audio.get_json(data, audio_id, duration, artwork_url, bitrate)
