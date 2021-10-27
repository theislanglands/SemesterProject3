import json

import yt_dlp

if __name__ == '__main__':
    ydl_opts = {
        'format': 'bestaudio/best',
        'writeinfojson': True,
        'clean_infojson': True,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',

        }], }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        #ydl.download('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        response = ydl.extract_info('https://www.youtube.com/watch?v=A3QAqZQYLIQ')
        print(response)












