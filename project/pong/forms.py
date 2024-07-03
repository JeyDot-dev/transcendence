from django import forms
from .models import GameSettings

class GameSettingsForm(forms.ModelForm):
    class Meta:
        model = GameSettings
        fields = ['paddle_speed', 'ball_speed', 'framerate']
