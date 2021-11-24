from django.db import models
from django import forms


class AudioObject(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    JSON = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.audio_id


class AudioFile(models.Model):
    name = models.CharField(max_length=255, null=True)
    title = models.CharField(max_length=255)

    artfile = models.FileField(null=True)
    audiofile = models.FileField(upload_to='temp')
