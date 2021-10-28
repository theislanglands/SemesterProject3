from django.db import models


    duration = None
class Metadata(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    name = models.CharField(max_length=255)
    artist = models.CharField(max_length=255)
    release_year = models.IntegerField(null=True)
    is_collection = models.BooleanField(null=True)
    collection_name = models.BooleanField(null=True)
    track_nr = models.IntegerField(null=True)
    total_track_count = models.IntegerField(null=True)
    duration = models.IntegerField(null=True)
    artwork_url = models.CharField(max_length=255, null=True)
    audiotype = models.CharField(max_length=255, null=True)
    bitrate = models.IntegerField(null=True)

    def __str__(self):
        return_string = self.audio_id + ' ' + self.name
        return return_string


