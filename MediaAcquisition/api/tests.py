from django.test import TestCase
from api.metadata import *
import requests


class MetaDataTestCase(TestCase):
    # test creating an metadata object
    def test_create_metadata_object(self):
        metadata = Metadata()
        metadata.name = "My heart will go on"
        metadata.artist = "Celine Dion"
        metadata.audio_type = "mp3"
        metadata.audio_id = "YT73564856"
        self.assertEqual(metadata.name, "My heart will go on", "title not correct")
        self.assertEqual(metadata.artist, "Celine Dion", "artist not correct")
        self.assertEqual(metadata.audio_type, "mp3", "audio type not correct")
        self.assertEqual(metadata.audio_id, "YT73564856", "audio id not correct")

    # test parsing object to Jso
    def test_parse_to_json(self):
        # creating test object
        metadata = Metadata()
        metadata.name = "My heart will go on"
        metadata.artist = "Celine Dion"
        metadata.audio_type = "mp3"
        metadata.audio_id = "YT73564856"

        # test object as json
        metadata_json = '{"audio_id": "YT73564856", "name": "My heart will go on", "artist": "Celine Dion", "duration": null, "release_year": null, "artwork": null, "collection": false, "collection_name": null, "track_nr": null, "total_track_count": null, "audio_type": "mp3", "bitrate": null, "created_at": null, "updated_at": null}'

        # calling method to create jason
        metadata_asJson = parse_to_json(metadata)

        # check if equal
        self.assertEqual(metadata_json, metadata_asJson)

    def test_reading_from_youtube(self):
        metadata_result = '{"audio_id": "YT_lWA2pjMjpBs", "name": "Diamonds", "artist": "Rihanna", "duration": 283, ' \
                          '"release_year": "20121108", "artwork": ' \
                          '"https://i.ytimg.com/vi_webp/lWA2pjMjpBs/maxresdefault.webp", "collection": false, ' \
                          '"collection_name": null, "track_nr": null, "total_track_count": null, "audio_type": "mp3", ' \
                          '"bitrate": null, "created_at": "28/10/2021 10:10:27", "updated_at": null} '

        parse_from_youtube_json(metadata_result)

        # file = open('/Users/theislanglands/Dropbox/SDU/Semester3/semesterprojekt/gitlab/media-acquisition/MediaAcquisition/json_examples_youtube/Rihanna_-_Diamonds_lWA2pjMjpBs.info.json')

        # newJson = parse_from_youtube_json(file)

        # self.assertEqual(metadata_result, newJson, "youtube metadata failed - denne test har bugs i metadata_result")

