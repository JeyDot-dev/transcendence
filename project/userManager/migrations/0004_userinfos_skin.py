# Generated by Django 5.0.6 on 2024-07-05 22:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userManager', '0003_userinfos_total_games_userinfos_total_victories'),
    ]

    operations = [
        migrations.AddField(
            model_name='userinfos',
            name='skin',
            field=models.CharField(default='255,255,255', max_length=11),
        ),
    ]
