import os

import yt_dlp

from yt_dlp import YoutubeDL
from MediaAcquisition.api.metadata import Metadata

from MediaAcquisition.api.persistence.persistenceController import PersistanceController


class YoutubeAudioDL:
    persistence = PersistanceController()

    ydl_opts = {
        'format': 'bestaudio/best',
        # 'writeinfojson': True,
        'clean_infojson': True,
        'outtmpl': os.getcwd() + '/temp' '/YT_%(id)s.%(ext)s',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }], }

    def init(self):
        pass

    def get_json(self, youtube_id):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            json_data = ydl.extract_info(youtube_id[0], download=False)
            meta = Metadata()
            json_new = meta.parse_from_youtube_json(json_data)
            return json_new

    def store_mp3(self, youtube_id):
        # Download mp3
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            ydl.download(youtube_id)

        # store in filesystem on server
        local_path = os.getcwd() + '/temp/'
        filename = 'YT_' + youtube_id[0] + '.mp3'
        # print("fn: " + filename)
        # print("lp: " + local_path)
        success = self.persistence.storeAudio(local_path + filename, filename)

        # handle success responce
        if success:
            try:
                os.remove(local_path + filename)  # delete local
            except IOError as e:
                print("error: local file not deleted\n" + e)
                # TODO: THEN do what?
            finally:
                return '200 OK'
        else:
            return 'error 500: internal server error'

        # TODO retry 5 gange

    def getALL(self, youtubeID):
        self.store_mp3(youtubeID)
        jsondata = self.get_json(youtubeID)

        return jsondata


#if __name__ == '__main__':
#    y = YoutubeAudioDL()
#    y.getALL(['j8fHNdrZTSI'])
