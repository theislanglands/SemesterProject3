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
with yt_dlp.YoutubeDL(ydl_opts) as ydl:
    ydl.download(['https://www.youtube.com/watch?v=kffacxfA7G4'])
