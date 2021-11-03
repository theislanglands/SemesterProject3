from audioManager.ytdlcontroller import YoutubeAudioDL
from api.persistence.persistenceController import PersistanceController

class domainController:
    def __init__(self):
        self.yt_download = YoutubeAudioDL()
        self.persistance = PersistanceController()

    def get_json(self, youtube_id):
        return self.yt_download.get_json(youtube_id)

    def store_youtube_mp3(self, youtube_id):
        return self.yt_download.store_mp3(youtube_id)

    def store_mp3(self, audio_mp3, metadata):
        pass


    def get_audio(self, id):
        return self.persistance.getAudio(id)

    def delete_audio(self, id):
        return self.persistance.delete_audio(id)

#dc = domainController()
#print(dc.store_mp3('IJLj1aTmSxw'))
