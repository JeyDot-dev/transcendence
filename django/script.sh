#!/bin/bash

# Check if Django project exists
sleep 5
if [[ ! -e /project/manage.py ]]; then
	django-admin startproject project .
	mv /etc/settings.py /project/project/settings.py
	django-admin migrate
else
	echo "Django project already exists."
fi
mv /etc/settings.py /project/project/settings.py

exec "$@"
