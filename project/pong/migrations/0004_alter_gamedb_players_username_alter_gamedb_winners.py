# Generated by Django 5.0.6 on 2024-07-07 01:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0003_rename_tournament_tournamentdb'),
    ]

    operations = [
        migrations.AlterField(
            model_name='gamedb',
            name='players_username',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='gamedb',
            name='winners',
            field=models.JSONField(default=list),
        ),
    ]