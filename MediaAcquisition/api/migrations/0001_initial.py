# Generated by Django 3.2.9 on 2021-11-12 19:45

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='AudioObject',
            fields=[
                ('audio_id', models.CharField(max_length=255, primary_key=True, serialize=False)),
                ('JSON', models.JSONField(blank=True, null=True)),
            ],
        ),
    ]