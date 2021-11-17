from django import forms
from api.models import AudioStore


class AudioForm(forms.ModelForm):
    class Meta:
        model=AudioStore
        fields=['record']


