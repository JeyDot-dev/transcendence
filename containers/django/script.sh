#!/bin/bash

# Check if Django project exists
if [[ ! -e /project/manage.py ]]; then
	echo "The project seems to be missing manage.py"
	exit 1
else
	echo "Django is  setup."
fi

exec "$@"
