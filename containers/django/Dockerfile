FROM    python:3.12.4-bookworm

COPY    django/requirements.txt /etc/
COPY    ../scripts/django_setup.sh /django_setup.sh

RUN     chmod +x /django_setup.sh
RUN     pip3 install -r /etc/requirements.txt --no-cache-dir

WORKDIR /project
EXPOSE  8000
ENTRYPOINT ["/django_setup.sh"]
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
