# Generated by Django 5.0.6 on 2024-09-17 16:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('userManager', '0002_alter_userinfos_profile_pic'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userinfos',
            name='profile_pic',
            field=models.ImageField(blank=True, default='/default.jpg', null=True, upload_to='profile_pics/'),
        ),
    ]