from django import forms


class AudioForm(forms.Form):
    name = forms.CharField(max_length=255)
    artfile = forms.FileField(required=False)
    audiofile = forms.FileField()

