import yt_dlp


class YoutubeDL:
    ydl_opts = {
        'format': 'bestaudio/best',
        'writeinfojson': True,
        'cleaninfojson': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'outtmpl': 'YT%(id)s', }

    def init(self):
        pass

    def get_json(self, url):
        try:

            with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
                json_data = ydl.extract_info(url, download=False)
                return json_data
        except Exception:
            return None



    def get_mp3(self, url):
        # Download mp3
        # send to server
        # if succes. return TRue, 200 'ok'
        pass


if __name__ == '__main__':
    y = YoutubeDL()
    data = y.get_json('dQw4w9WgXcQ')
    print(data['id'])



