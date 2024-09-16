from django import forms
from .models import Player

class newGameForm(forms.Form):
    player1_name = forms.CharField(label='Player 1 Name', max_length=100)
    player2_name = forms.CharField(label='Player 2 Name', max_length=100)

class addPlayer(forms.ModelForm):
    class Meta:
        model = Player
        fields = ['name']

    def clean_name(self):
        name = self.cleaned_data.get('name').strip()
        if not name:
            return None
        return name

class UniquePlayerFormSet(forms.BaseModelFormSet):
    def clean(self):
        super().clean()

        names = []
        for form in self.forms:
            if form.cleaned_data:
                name = form.cleaned_data.get('name')
                if name:
                    if name in names:
                        form.add_error('name', 'Name must be unique within the formset.')
                    names.append(name)

PlayerFormSet = forms.modelformset_factory(Player, form=addPlayer, formset=UniquePlayerFormSet, fields=['name'], extra=1)

class newTournamentForm(forms.Form):
    tournament_title = forms.CharField(label='Tournament Title', max_length=100)

class GameResultForm(forms.Form):
    winner = forms.CharField(label='game winner', max_length=100)
    game = forms.IntegerField(label='gameId')

class tournamentIdForm(forms.Form):
    tournamentId = forms.CharField(label='Tournament Id', max_length=100)
    
class GameSettingsForm(forms.Form):
    timer = forms.IntegerField(label='Timer', initial=120, max_value=600)
    score = forms.IntegerField(label='Total Score', initial=5, max_value=10)
    top_spin = forms.BooleanField(label='Top Spin')
    back_spin = forms.BooleanField(label='Back Spin')
    side_spin = forms.BooleanField(label='Side Spin')