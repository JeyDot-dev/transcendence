import json
from channels.generic.websocket import AsyncWebsocketConsumer
import asyncio

class CubeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.accept()
        self.cubeSize = 1
        self.cubeX = 0
        self.cubeY = 0
        self.cubeZ = 0
        self.rotateX = False
        self.rotateY = False
        self.rotateZ = False
        self.running = True
        self.framerate = 1
        await self.send(text_data=json.dumps({
            'cubeSize': self.cubeSize,
            'cubeX': self.cubeX,
            'cubeY': self.cubeY,
            'cubeZ': self.cubeZ
        }))
        asyncio.ensure_future(self.game_loop())

    async def disconnect(self, code):
        self.running = False
        return await super().disconnect(code)

    async def loop(self):
        while self.running:
            await asyncio.sleep(1 / self.framerate)
            self.updateState()
            await self.sendState()

    def updateState(self):
        self.rotateX = not self.rotateX

    async def sendState(self):
        await self.send(text_data=json.dumps({
                'rotateX': self.rotateX,
                'rotateY': self.rotateY,
                'rotateZ': self.rotateY
        }))
