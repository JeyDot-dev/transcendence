# Generated by Django 5.0.6 on 2024-07-07 01:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pong', '0006_alter_gamedb_players_username_alter_gamedb_winners'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tournamentdb',
            name='winner',
        ),
        migrations.AddField(
            model_name='tournamentdb',
            name='winners',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='tournamentdb',
            name='games_id',
            field=models.JSONField(default=list),
        ),
        migrations.AlterField(
            model_name='tournamentdb',
            name='players_username',
            field=models.JSONField(default=list),
        ),
    ]
