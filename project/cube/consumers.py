import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.layers import get_channel_layer
import asyncio

class CubeConsumer(AsyncWebsocketConsumer):
    group_name = "cube_updates"
    connection_count = 0
    orientation_state = {'x': 0, 'y': 0, 'z': 0}
    rotation_state = {'x': 0, 'y': 0, 'z': 0}


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
        self.rotateX = CubeConsumer.rotation_state['x']
        self.rotateY = CubeConsumer.rotation_state['y']
        self.rotateZ = CubeConsumer.rotation_state['z']
        self.running = True
        self.framerate = 5
        self.rotation = CubeConsumer.orientation_state

        await self.send(text_data=json.dumps({
            'type': 'init',
            'cubeSize': self.cubeSize,
            'cubeX': self.cubeX,
            'cubeY': self.cubeY,
            'cubeZ': self.cubeZ,
            # 'rotateX': self.rotateX,
            # 'rotateY': self.rotateY,
            # 'rotateZ': self.rotateZ,
            # 'rotation': self.rotation
            'rotateX': CubeConsumer.rotation_state['x'],
            'rotateY': CubeConsumer.rotation_state['y'],
            'rotateZ': CubeConsumer.rotation_state['z'],
            'rotation': CubeConsumer.orientation_state
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
                self.rotateX -= 1
                CubeConsumer.rotation_state['x'] -= 1
            elif keypress == 'ArrowRight':
                self.rotateX += 1
                CubeConsumer.rotation_state['x'] += 1
            elif keypress == 'ArrowUp':
                self.rotateY += 1
                CubeConsumer.rotation_state['y'] += 1
            elif keypress == 'ArrowDown':
                self.rotateY -= 1
                CubeConsumer.rotation_state['y'] -= 1

            # await self.channel_layer.group_send(
            #     self.group_name,
            #     {
            #         'type': 'rotation_update',
            #         'rotateX': self.rotateX,
            #         'rotateY': self.rotateY,
            #         'rotateZ': self.rotateZ,
            #     }
            # )
        elif 'type' in data and data['type'] == 'current_rotation':
            self.rotation = data['rotation']
            CubeConsumer.orientation_state = self.rotation
            # await self.channel_layer.group_send(
            #     self.group_name,
            #     {
            #         'type': 'current_rotation',
            #         'rotation': self.rotation
            #     }
            # )


    def updateState(self):
        self.rotateX = CubeConsumer.rotation_state['x']
        self.rotateY = CubeConsumer.rotation_state['y']
        self.rotateZ = CubeConsumer.rotation_state['z']
        # self.rotation = CubeConsumer.orientation_state

    async def sendState(self):
        await self.send(text_data=json.dumps({
            'type': 'rotation',
            'rotateX': self.rotateX,
            'rotateY': self.rotateY,
            'rotateZ': self.rotateZ
        }))

    # async def rotation_update(self, event):
    #     self.rotateX = event['rotateX']
    #     self.rotateY = event['rotateY']
    #     self.rotateZ = event['rotateZ']
    #     await self.send(text_data=json.dumps({
    #         'type': 'rotation',
    #         'rotateX': self.rotateX,
    #         'rotateY': self.rotateY,
    #         'rotateZ': self.rotateZ
    #     }))

