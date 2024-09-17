import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
import asyncio
from asyncio import Lock
from pong.logger import logger

matchmaking_queue = []
queue_lock = Lock()

class MatchmakingConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        self.user = self.scope['user']
        self.group_name = f"user_{self.user.username}"

        await self.accept()

        if not self.user.is_authenticated:
            # logger.warning(f"Anonymous user tried to join matchmaking: {self.user}.")
            await self.send(text_data=json.dumps({
                'type': 'Matchmaking',
                'action': 'close',
                'message': 'You cannot join the matchmaking queue (anonymous)'
            }))
            await self.close()

        await self.channel_layer.group_add(self.group_name, self.channel_name)
        # logger.info(f"User {self.user.username} added to group {self.group_name}")

        await self.set_user_online(True)
        # logger.info(f"User {self.user.username} has been set to online and added to matchmaking queue.")

        matchmaking_queue.append(self.user)
        await self.send(text_data=json.dumps({
            'type': 'Matchmaking',
            'message': f'You have joined the matchmaking queue, {self.user.username}'
        }))

        # logger.debug(f"Matchmaking queue: {[user.username for user in matchmaking_queue]}")
        
        asyncio.create_task(self.match_players())

    async def disconnect(self, close_code):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        if self.user in matchmaking_queue:
            matchmaking_queue.remove(self.user)
            # logger.info(f"User {self.user.username} has been removed from the matchmaking queue.")

        await self.set_user_online(False)
        # logger.info(f"User {self.user.username} set to offline.")

        await self.channel_layer.group_discard(self.group_name, self.channel_name)
        # logger.info(f"User {self.user.username} removed from group {self.group_name}")

    async def match_players(self):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        while True:
            await asyncio.sleep(5) # Change time here for how much you have to wait before paiiring players
            queue_info = [user.username for user in matchmaking_queue]

            # logger.info(f"Matchmaking check: queue contains {len(matchmaking_queue)} players.")
            await self.send(text_data=json.dumps({
                'type': 'Matchmaking',
                'message': f'Searching for other players... , {self.user.username}',
                'queue': queue_info
            }))

            # Protect access to the queue with a lock to prevent race conditions
            async with queue_lock:
                if len(matchmaking_queue) >= 2:
                    player1 = matchmaking_queue.pop(0)
                    player2 = matchmaking_queue.pop(0)
                    # logger.info(f"Match found: {player1.username} vs {player2.username}")

                    game_ws_id = await database_sync_to_async(generate_unique_id)()
                    # logger.debug(f"Generated game_ws_id: {game_ws_id}")

                    await self.create_game(player1, player2, game_ws_id)
                    # logger.info(f"Game created between {player1.username} and {player2.username}, game_ws_id={game_ws_id}")

                    await self.set_players_playing(player1, player2, True)
                    # logger.info(f"Players {player1.username} and {player2.username} are now marked as playing.")

                    # Send match found message ONLY to both players via their respective groups
                    await self.channel_layer.group_send(
                        f"user_{player1.username}",
                        {
                            'type': 'send_match_found',
                            'game_ws_id': game_ws_id,
                            'message': f'Match found for {player1.username} and {player2.username}'
                        }
                    )
                    await self.channel_layer.group_send(
                        f"user_{player2.username}",
                        {
                            'type': 'send_match_found',
                            'game_ws_id': game_ws_id,
                            'message': f'Match found for {player1.username} and {player2.username}'
                        }
                    )

    async def send_match_found(self, event):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        await self.send(text_data=json.dumps({
            'type': 'match_created',
            'message': event['message'],
            'game_ws_id': event['game_ws_id']
        }))

    @database_sync_to_async
    def set_user_online(self, is_online):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        user = UserInfos.objects.get(username=self.user.username)
        user.is_online = is_online
        user.save()
        # logger.info(f"User {user.username} status set to {'online' if is_online else 'offline'}.")

    @database_sync_to_async
    def create_game(self, player1, player2, game_ws_id):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        player1_instance, _ = Player.objects.get_or_create(user=player1, defaults={'name': player1.username})
        player2_instance, _ = Player.objects.get_or_create(user=player2, defaults={'name': player2.username})

        game = Game.objects.create(player1=player1_instance, player2=player2_instance, game_ws_id=game_ws_id)
        player1_instance.user.match_history.add(game)
        player2_instance.user.match_history.add(game)
        # logger.info(f"Game object created between {player1.username} and {player2.username} with game_ws_id={game_ws_id}.")
        return game

    @database_sync_to_async
    def set_players_playing(self, player1, player2, is_playing):
        from userManager.models import UserInfos
        from database.models import Game, Player, generate_unique_id
        player1_instance = UserInfos.objects.get(username=player1.username)
        player2_instance = UserInfos.objects.get(username=player2.username)
        player1_instance.is_playing = is_playing
        player2_instance.is_playing = is_playing
        player1_instance.save()
        player2_instance.save()
        # logger.info(f"Players {player1.username} and {player2.username} set to {'playing' if is_playing else 'not playing'}.")
