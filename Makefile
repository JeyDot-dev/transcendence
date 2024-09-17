MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

all: help
	@echo "!!IF YOU MODIFIED SETTINGS.PY IN project/transcendence, MAKE SURE TO BACK IT UP OR REPLACE THE APPROPRIATE FILE IN /django-settings!!"
	@echo "make = make help"
makemigrations:
	docker exec daphne python manage.py makemigrations
makemigrations-noinput:
	docker exec daphne python manage.py makemigrations --noinput
migrate:
	docker exec daphne python manage.py migrate
collectstatic:
	docker exec -it daphne python manage.py collectstatic
prod-up:
	docker compose up
prod-down:
	docker compose down
prod-clean: 
	-docker compose down
prod-fclean: prod-clean
	-docker rmi --force $$(docker images -q "transcendence*")
	-docker volume rm $$(docker volume ls -q | grep transcendence) --force
prod-re: prod-clean
	docker compose -f docker-compose/production-compose.yml up --build
prod-fre: prod-fclean
	docker compose -f docker-compose/production-compose.yml up --build
nuke:
	docker system prune -a -f
help:
	commands for PRODUCTION setup:\n\
	\t prod-up | prod-down | prod-clean | prod-re | prod-fclean (!DELETES DB) | prod-fre(! DELETES DB and rebuild)\n\
	note: clean only removes images created by the project | not images that have been downloaded from official repos"


.PHONY: all dev-re dev-down dev-up dev-clean dev-fclean help makemigrations migrate dev-fre\
	prod-up prod-down prod-clean prod-re prod-fclean prod-fre
