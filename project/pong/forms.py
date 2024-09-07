from django import forms

class GameResultForm(forms.Form):
    winner = forms.CharField(label='game winner', max_length=100)
    game = forms.IntegerField(label='gameId')