from django.db import models





class AudioFile(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    JSON = models.JSONField(null=True, blank=True)
    artfile = models.FileField(null=True)
    audiofile = models.FileField(upload_to='temp')



class AudioObject(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    JSON = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.audio_id



