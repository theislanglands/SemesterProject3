import os

import yt_dlp

# from MediaAcquisition.api import metadata
from yt_dlp import YoutubeDL

from MediaAcquisition.api.persistence.persistenceController import PersistanceController


class YoutubeAudioDL:
    persitence = PersistanceController()

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

    def get_json(self, url):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            json_data = ydl.extract_info(url, download=False)
            return json_data

    def get_mp3(self, youtube_id):

        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            # Download mp3
            ydl.download(youtube_id)

        # send to server
        local_path = os.getcwd() + '/temp/'
        filename = 'YT_' + youtube_id[0] + '.mp3'

        # print("fn: " + filename)
        # print("lp: " + local_path)

        # store in filesystem and delete local
        success = self.persitence.storeAudio(local_path + filename, filename)
        if success:
            try:
                os.remove(local_path + filename)
            except IOError as e:
                print("local file not deleted \n" + e)
                #TODO: THEN do what?
            finally:
                return '200 OK'
        else:
            return 'error 500: internal server error'

        # TODO retry 5 gange


if __name__ == '__main__':
    y = YoutubeAudioDL()
    print(y.get_mp3(['vosH4sRJgQA']))
