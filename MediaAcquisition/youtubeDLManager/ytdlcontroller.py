import yt_dlp

ydl_opts = {
    'format': 'bestaudio/best',
    'writeinfojson': True,
    'clean_infojson': True,
    'postprocessors': [{
        'key': 'FFmpegExtractAudio',
        'preferredcodec': 'mp3',
        'preferredquality': '192',

    }], }


def ytDL(url):
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])



if __name__ == '__main__':


    url = input()
    ytDL(url)


class YoutubeDL():

    def __init__(self, url):
            self.url = url


    def get_json(self):
        #jsondata = YDL.EXTRACTINFO(url)
        #

        pass

    def get_mp3(self):
        pass


