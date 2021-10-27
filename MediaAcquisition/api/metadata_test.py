
from metadata import *

#test reading youtube JSON
def test_reading_youtube_json(nr):
    if nr == 1:
        file = open('/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/gitlab/media-acquisition/MediaAcquisition/json_examples_youtube/Rihanna_-_Diamonds_lWA2pjMjpBs.info.json')
    if nr == 2:
        file = open('/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/media-acquisition/MediaAcquisition/json_examples_youtube/Celine_Dion_-_My_Heart_Will_Go_On_HD_A3QAqZQYLIQ.info.json')
    if nr == 3:
        file = open('/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/media-acquisition/MediaAcquisition/json_examples_youtube/Slipknot_-_Psychosocial_OFFICIAL_VIDEO_5abamRO41fE.info.json')
    if nr == 4:
        file = open('/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/media-acquisition/MediaAcquisition/json_examples_youtube/Nik__Jay_-_Lkker_GZL4oZI2Ro0.info.json')

    newJson = parse_from_youtube_json(file)
    return newJson

# test creating an metadata object
def test_creating_metadata_object():
    metadata = Metadata()
    metadata.name = "My heart will go on"
    metadata.artist = "Celine Dion"
    metadata.audio_type = "mp3"
    metadata.audio_id = "YT73564856"
    return metadata

# test parsing object to Jso
def test_parse_to_json(metadata):
    metadata_asJson = parse_to_json(metadata)
    return metadata_asJson

## !test-center!

md = test_creating_metadata_object()
print('test creating a new MetaData object')
print(md)

md_json = parse_to_json(md)
print("\ntest parsing it to json")
print(md_json)

yt_json = test_reading_youtube_json(1)
print("\ntest parsing youtube json to metadata json")
print(yt_json)