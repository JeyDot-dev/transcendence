# Generated by Django 5.0.6 on 2024-09-12 15:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('database', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='game_ws_id',
            field=models.CharField(default=0),
        ),
    ]