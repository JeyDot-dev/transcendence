MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

all:
	mkdir -p $(MAKEFILE_DIR)/django/projet
	docker compose up
makemigrations:
	docker exec django manage.py makemigrations
migrate:
	docker exec django manage.py migrate
up: all
down:
	docker compose down
clean: 
	-docker compose down
	-docker rmi --force $$(docker images -q "transcendence*")
fclean: clean
	-docker volume transcendence_elastic_data transcendence_postgres_data --force
help:
	@echo "[cmds: all, makemigrations, migrate, up, down, clean, re, fclean (!deletes db), fre(!deletes db and rebuild)]\nclean only removes images created by the project, not images that have been downloaded from official repos"
re: clean
	docker compose up --build
fre: fclean
	
	.PHONY: all re down up clean fclean help makemigrations migrate fre

