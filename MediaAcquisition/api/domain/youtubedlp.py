import yt_dlp


class YoutubeDL:
    ydl_opts = {
        'format': 'bestaudio/best',
        'writeinfojson': True,
        'clean_infojson': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',

        }], }


    def init(self):
        pass

    def get_json(self, url):
        with yt_dlp.YoutubeDL(self.ydl_opts) as ydl:
            json_data = ydl.extract_info(url)
            return json_data


    def get_mp3(self):
        pass


if __name__ == '__main__':
    y = YoutubeDL()
    data = y.get_json('dQw4w9WgXcQ')
    print(data['id'])

