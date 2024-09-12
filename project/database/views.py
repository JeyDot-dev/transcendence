from django.http import JsonResponse
from django.shortcuts import get_object_or_404, render
from .models import Player, Tournament, Game
from .forms import get_player_formset, newTournamentForm
from database.logger import logger
import json

def new_tournament(request):
    if request.method == 'POST':
        logger.info(f"POST data: {request.POST}")
        form = newTournamentForm(request.POST)
        player_count = int(request.POST.get('player-count', 0))

        # Dynamically generate the formset based on player count
        PlayerFormSetDynamic = get_player_formset(player_count)
        formset = PlayerFormSetDynamic(request.POST)

        logger.info('Form data received for tournament creation')
        logger.info(f'Tournament form valid: {form.is_valid()}')
        logger.info(f'Player formset valid: {formset.is_valid()}')

        # Log form errors if validation fails
        if not form.is_valid():
            logger.error(f"Tournament form errors: {form.errors}")
        
        if not formset.is_valid():
            logger.error(f"Player formset errors: {formset.errors}")
            logger.error(f"Non-form errors: {formset.non_form_errors()}")

        if form.is_valid() and formset.is_valid():
            logger.info('Both form and formset are valid. Proceeding with tournament creation.')

            # Create and save the tournament
            tournament = form.save()

            # Log each form in the formset and check if name is present
            for i, player_form in enumerate(formset):
                logger.info(f"Form {i} cleaned data: {player_form.cleaned_data}")
                if player_form.cleaned_data.get('name'):
                    player = player_form.save()
                    logger.info(f"Adding player {player.name} to tournament {tournament.name}")
                    tournament.players.add(player)

            tournament.save()

            logger.info(f'Tournament {tournament.name} created successfully with ID {tournament.id}')
            logger.info(f"Tournament players: {list(tournament.players.all())}")
            
            tournament.make_games()  # Generate first pool of games
            return JsonResponse({
                'message': 'Tournament created successfully',
                'tournament_id': tournament.id
            })
        else:
            logger.warning('Tournament or player formset is invalid.')

    else:
        form = newTournamentForm()
        formset = get_player_formset(0)
        logger.info('Rendering empty tournament form')

    return render(request, 'index.html', {'form': form, 'formset': formset})

def get_pool_games(request, t_id):
    """Fetch a list of games for the current pool in JSON format."""
    tournament = get_object_or_404(Tournament, pk=t_id)
    
    last_pool = tournament.pools.order_by('-round_number').first()
    if not last_pool:
        return JsonResponse({'error': 'No pools available'}, status=404)
    
    games = []
    for game in last_pool.games.all():
        games.append({
            'game_id': game.id,
            'game_ws_id': game.game_ws_id,
            'players': [game.player1.name, game.player2.name]
        })
    
    return JsonResponse({'tournament_id': tournament.id, 'games': games})

def next_pool(request, t_id):
    """Request the next pool of games for a tournament in JSON format."""
    tournament = get_object_or_404(Tournament, pk=t_id)

    last_pool = tournament.pools.order_by('-round_number').first()

    if not last_pool:
        # No pool exists yet, so create the first one
        tournament.make_games()
    elif tournament.get_unplayed_games().exists():
        # If there are still unplayed games in the current pool, return them
        return get_pool_games(request, t_id)
    else:
        # All games in the current pool are played, so generate a new pool
        tournament.make_games()

    # Check if the tournament is complete
    tournament.finalize_tournament()
    if tournament.winner:
        return JsonResponse({
            'message': 'Tournament complete.',
            'tournament_winner': tournament.winner.name,
            'tournament_id': tournament.id
        })

    # Return the new pool of games
    return get_pool_games(request, t_id)

def get_game_winner(request, game_ws_id):
    game = get_object_or_404(Game, game_ws_id=game_ws_id)

    if not game.is_played:
        logger.warning(f"Game {game_ws_id} is not yet played.")
        return JsonResponse({'error': 'Game has not been played yet.'}, status=400)

    winner = game.winner
    if winner:
        logger.info(f"The winner for game {game_ws_id} is {winner.name}")
        return JsonResponse({'winner': winner.name})
    else:
        logger.warning(f"No winner found for game {game_ws_id}.")
        return JsonResponse({'error': 'No winner found for this game.'}, status=404)
