FROM    python:3.12.4-bookworm
COPY    requirements.txt /etc/
RUN     pip3 install -r requirements.txt --no-cache-dir

WORKDIR /app
EXPOSE  8000
COPY    app/. /app
ENTRYPOINT ["python3"]
CMD ["manage.py", "runserver", "0.0.0.0:8000"]
