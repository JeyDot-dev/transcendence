# Generated by Django 5.0.6 on 2024-09-17 15:56

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GameDB',
            fields=[
                ('id', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('players_username', models.JSONField(default=list)),
                ('ball_color', models.CharField(default='#FFFFFF', max_length=7)),
                ('left_score', models.IntegerField(default=0)),
                ('right_score', models.IntegerField(default=0)),
                ('started', models.BooleanField(default=False)),
                ('finished', models.BooleanField(default=False)),
                ('winners', models.JSONField(default=list)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('nb_max_players', models.IntegerField(default=2)),
            ],
        ),
        migrations.CreateModel(
            name='TournamentDB',
            fields=[
                ('id', models.CharField(max_length=200, primary_key=True, serialize=False)),
                ('name', models.CharField(default='Tournament', max_length=50)),
                ('nb_player_per_team', models.IntegerField(default=1)),
                ('nb_players', models.IntegerField(default=4)),
                ('finished', models.BooleanField(default=False)),
                ('started', models.BooleanField(default=False)),
                ('winners', models.JSONField(default=list)),
                ('ready', models.BooleanField(default=False)),
                ('games_id', models.JSONField(default=list)),
                ('players_username', models.JSONField(default=list)),
            ],
        ),
    ]
