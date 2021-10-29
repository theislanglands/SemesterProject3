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

    def get_json(self, youtubeID):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            json_data = ydl.extract_info(youtubeID, download=False)
            meta = Metadata()
            json_new = meta.parse_from_youtube_json(json_data)
            return json_new

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
    meta = Metadata()
    print(y.get_json('vosH4sRJgQA'))
    # print(y.get_mp3(['vosH4sRJgQA'])
    #json_new = meta.parse_from_youtube_json(json)
    #print(json_new)


