import os

import yt_dlp

from MediaAcquisition.api import metadata


class YoutubeDL:
    ydl_opts = {
        'format': 'bestaudio/best',
        #'writeinfojson': True,
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

    def get_mp3(self, url):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            # Download mp3
            ydl.download(url)
            # send to server

        # if succes. return TRue, 200 'ok'
        pass


if __name__ == '__main__':
    y = YoutubeDL()
    print(y.get_json('vosH4sRJgQA'))
    # data = y.get_json('vosH4sRJgQA')
    y.get_mp3(['vosH4sRJgQA'])

