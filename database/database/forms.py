from django import forms
from .models import Player

class newGameForm(forms.Form):
    player1_name = forms.CharField(label='Player 1 Name', max_length=100)
    player2_name = forms.CharField(label='Player 2 Name', max_length=100)

class addPlayer(forms.ModelForm):
    class Meta:
        model = Player
        fields = ['name']

PlayerFormSet = forms.modelformset_factory(Player, form=addPlayer, fields=['name'], extra=3)

class newTournamentForm(forms.Form):
    tournament_title = forms.CharField(label='Tournament Title', max_length=100)

