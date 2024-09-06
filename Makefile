MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

all: help
	@echo "!!IF YOU MODIFIED SETTINGS.PY IN project/transcendence, MAKE SURE TO BACK IT UP OR REPLACE THE APPROPRIATE FILE IN /django-settings!!"
	@echo "make = make help"
makemigrations:
	docker exec django python manage.py makemigrations
migrate:
	docker exec django python manage.py migrate
collectstatic:
	docker exec -it daphne python manage.py collectstatic
dev-up: cp-dev
	docker compose -f docker-compose/dev-compose.yml up
dev-down:
	docker compose -f docker-compose/dev-compose.yml down
dev-clean: 
	-docker compose -f docker-compose/dev-compose.yml down
dev-fclean: dev-clean
	-docker rmi --force $$(docker images -q "transcendence*")
	-docker volume rm $$(docker volume ls -q | grep transcendence) --force
dev-re: dev-clean cp-dev
	docker compose -f docker-compose/dev-compose.yml up --build
dev-fre: dev-fclean cp-dev
	docker compose -f docker-compose/dev-compose.yml up --build
	
prod-up: cp-prod
	docker compose -f docker-compose/production-compose.yml up
prod-down:
	docker compose -f docker-compose/production-compose.yml down
prod-clean: 
	-docker compose -f docker-compose/production-compose.yml down
prod-fclean: prod-clean
	-docker rmi --force $$(docker images -q "transcendence*")
	-docker volume rm $$(docker volume ls -q | grep transcendence) --force
prod-re: prod-clean cp-prod
	docker compose -f docker-compose/production-compose.yml up --build
prod-fre: prod-fclean cp-prod
	docker compose -f docker-compose/production-compose.yml up --build
nuke:
	docker system prune -a -f
help:
	@echo "commands for DEV setup:\n\
	\t dev-up | dev-down | dev-clean | dev-re | makemigrations | migrate | collectstatic\n\
	\t dev-fclean (!DELETES DB) | dev-fre (!DELETES DB and rebuild)\n\
	commands for PRODUCTION setup:\n\
	\t prod-up | prod-down | prod-clean | prod-re | prod-fclean (!DELETES DB) | prod-fre(! DELETES DB and rebuild)\n\
	note: clean only removes images created by the project | not images that have been downloaded from official repos"

cp-dev:
	-cp	$(MAKEFILE_DIR)django-settings/dev-settings.py $(MAKEFILE_DIR)project/transcendence/settings.py
cp-prod:
	-cp	$(MAKEFILE_DIR)/django-settings/prod-settings.py $(MAKEFILE_DIR)/project/transcendence/settings.py

.PHONY: all dev-re dev-down dev-up dev-clean dev-fclean help makemigrations migrate dev-fre\
	prod-up prod-down prod-clean prod-re prod-fclean prod-fre
