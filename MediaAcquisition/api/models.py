from django.db import models
from django import forms


class AudioObject(models.Model):
    audio_id = models.CharField(max_length=255, primary_key=True)
    JSON = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.audio_id


class AudioFile(models.Model):
    name = forms.CharField(max_length=255)
    title = forms.CharField(max_length=255)
    #artfile = forms.FileField(required=False)
    audiofile = models.FileField(upload_to='temp')