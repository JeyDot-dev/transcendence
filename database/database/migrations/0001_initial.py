# Generated by Django 5.0.6 on 2024-07-29 16:37

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=20)),
                ('psw', models.CharField(max_length=100)),
                ('matchesWon', models.IntegerField(default=0)),
                ('is_winner', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Tournament',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(default='Tournament', max_length=100)),
                ('winner', models.IntegerField(default=1)),
                ('players', models.ManyToManyField(blank=True, to='database.player')),
            ],
        ),
        migrations.CreateModel(
            name='Game',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points1', models.IntegerField(default=0)),
                ('points2', models.IntegerField(default=0)),
                ('is_played', models.BooleanField(default=False)),
                ('tournament', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='games', to='database.tournament')),
            ],
        ),
    ]
