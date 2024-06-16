FROM    python:3.12.4-bookworm

COPY    requirements.txt /etc/
COPY    settings.py /etc/
COPY    script.sh /etc/
COPY    project/. /project

RUN     chmod +x /etc/script.sh
RUN     pip3 install -r /etc/requirements.txt --no-cache-dir

WORKDIR /project
EXPOSE  8000
ENTRYPOINT ["/etc/script.sh"]
CMD ["python3", "manage.py", "runserver", "0.0.0.0:8000"]
