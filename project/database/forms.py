from django import forms

class newGameForm(forms.Form):
    player1_name = forms.CharField(label='Player 1 Name', max_length=100)
    player2_name = forms.CharField(label='Player 2 Name', max_length=100)

class addPlayer(forms.Form):
    player_name = forms.CharField(label='Player Name', max_length=100)

class newTournamentForm(forms.Form):
    tournament_title = forms.CharField(label='Tournament Title', max_length=100)