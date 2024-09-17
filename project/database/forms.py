from django import forms
from .models import Player

class newGameForm(forms.Form):
    player1_name = forms.CharField(
        label='Player 1 Name', 
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    player2_name = forms.CharField(
        label='Player 2 Name', 
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

class addPlayer(forms.ModelForm):
    class Meta:
        model = Player
        fields = ['name']
        widgets = {
            'name': forms.TextInput(attrs={'class': 'form-control'})
        }

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
                        form.add_error('name', 'All player names must be unique.')
                    names.append(name)

PlayerFormSet = forms.modelformset_factory(Player, form=addPlayer, formset=UniquePlayerFormSet, fields=['name'], extra=1)

class newTournamentForm(forms.Form):
    tournament_title = forms.CharField(
        label='Tournament Title', 
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )

class GameResultForm(forms.Form):
    winner = forms.CharField(
        label='Game Winner', 
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    game = forms.IntegerField(
        label='Game ID', 
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )

class tournamentIdForm(forms.Form):
    tournamentId = forms.CharField(
        label='Tournament ID', 
        max_length=100, 
        widget=forms.TextInput(attrs={'class': 'form-control'})
    )
    
class GameSettingsForm(forms.Form):
    timer = forms.IntegerField(
        label='Timer', 
        initial=120, 
        max_value=600,
        min_value=1,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    score = forms.IntegerField(
        label='Total Score', 
        initial=5, 
        max_value=10, 
        min_value=1,
        widget=forms.NumberInput(attrs={'class': 'form-control'})
    )
    top_spin = forms.BooleanField(
        label='Top Spin', 
        required=False, 
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    back_spin = forms.BooleanField(
        label='Back Spin', 
        required=False, 
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
    side_spin = forms.BooleanField(
        label='Side Spin', 
        required=False, 
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'})
    )
