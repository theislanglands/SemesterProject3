from django.db import models


class AudioObject(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    JSON = models.JSONField(null=True, blank=True)


    def __str__(self):
        return_string = self.audio_id + ' ' + self.name
        return return_string


