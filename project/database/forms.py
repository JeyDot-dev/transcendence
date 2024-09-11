from django import forms
from .models import Player, Tournament

class PlayerForm(forms.ModelForm):
    """Form to create or update a player."""
    class Meta:
        model = Player
        fields = ['name']

    def clean_name(self):
        """Ensure player names are unique and valid."""
        name = self.cleaned_data.get('name')
        if Player.objects.filter(name=name).exists():
            raise forms.ValidationError(f"A player with the name {name} already exists.")
        return name

class newTournamentForm(forms.ModelForm):
    """Form to create a new tournament."""
    class Meta:
        model = Tournament
        fields = ['name']

    name = forms.CharField(
        max_length=100,
        widget=forms.TextInput(attrs={'placeholder': 'Tournament Name'}),
        label="Tournament Name"
    )

    def clean_name(self):
        """Ensure tournament names are valid."""
        name = self.cleaned_data.get('name')
        if not name:
            raise forms.ValidationError("Tournament name cannot be empty.")
        return name
class newGameForm(forms.Form):
    player1_name = forms.CharField(label='Player 1 Name', max_length=100)
    player2_name = forms.CharField(label='Player 2 Name', max_length=100)

class addPlayer(forms.ModelForm):
    class Meta:
        model = Player
        fields = ['name']

def get_player_formset(player_count):
    """Dynamically generate a formset based on the player count."""
    return forms.modelformset_factory(Player, form=addPlayer, fields=['name'], extra=player_count)

# class newTournamentForm(forms.Form):
#     tournament_title = forms.CharField(label='Tournament Title', max_length=100)

class GameResultForm(forms.Form):
    winner = forms.CharField(label='game winner', max_length=100)
    game = forms.IntegerField(label='gameId')


class tournamentIdForm(forms.Form):
    tournamentId = forms.CharField(label='Tournament Id', max_length=100)