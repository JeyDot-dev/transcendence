from django.contrib import admin
from .models import chatMessage, chatUser, chatPrivateRoom, account

# Register your models here.
admin.site.register(chatMessage)
admin.site.register(chatUser)
admin.site.register(chatPrivateRoom)
admin.site.register(account)
