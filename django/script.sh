#!/bin/bash

# Check if Django project exists
if [[ ! -e /project/manage.py ]]; then
	django-admin startproject project .
else
	echo "Django project already exists."
fi

exec "$@"
