import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import asyncio

class CubeConsumer(AsyncWebsocketConsumer):
    group_name = "cube_updates"

    async def connect(self):
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        self.cubeSize = 1
        self.cubeX = 2
        self.cubeY = 2
        self.cubeZ = 2
        self.rotateX = 0
        self.rotateY = 0
        self.rotateZ = 0
        self.running = True
        self.framerate = 60

        await self.send(text_data=json.dumps({
            'type': 'init',
            'cubeSize': self.cubeSize,
            'cubeX': self.cubeX,
            'cubeY': self.cubeY,
            'cubeZ': self.cubeZ
        }))
        asyncio.ensure_future(self.loop())

    async def disconnect(self, code):
        self.running = False
        await self.channel_layer.group_discard(
            self.group_name,
            self.channel_name
        )
        await super().disconnect(code)

    async def loop(self):
        while self.running:
            await asyncio.sleep(1 / self.framerate)
            self.updateState()
            await self.sendState()

    async def receive(self, text_data):
        data = json.loads(text_data)
        if 'keypress' in data:
            keypress = data['keypress']

            if keypress == 'ArrowLeft':
                self.rotateX += -1
            elif keypress == 'ArrowRight':
                self.rotateX += 1
            elif keypress == 'ArrowUp':
                self.rotateY += 1
            elif keypress == 'ArrowDown':
                self.rotateY += -1

            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'rotation_update',
                    'rotateX': self.rotateX,
                    'rotateY': self.rotateY,
                    'rotateZ': self.rotateZ
                }
            )

    def updateState(self):
        pass

    async def sendState(self):
        await self.send(text_data=json.dumps({
            'type': 'rotation',
            'rotateX': self.rotateX,
            'rotateY': self.rotateY,
            'rotateZ': self.rotateZ
        }))

    async def rotation_update(self, event):
        self.rotateX = event['rotateX']
        self.rotateY = event['rotateY']
        self.rotateZ = event['rotateZ']
        await self.send(text_data=json.dumps({
            'type': 'rotation',
            'rotateX': self.rotateX,
            'rotateY': self.rotateY,
            'rotateZ': self.rotateZ
        }))
