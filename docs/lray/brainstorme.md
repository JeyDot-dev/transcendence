# Brainstorme

## Les bases

### Backend

Pour le backend nous avons trois possibilités :

1) Pas de backend
2) Un backend écrit en pure *Ruby*
3) Un backend fait avec *Django*

Si nous mettons en place un backend, nous n'avons pas le choix de la base de donnée, nous devons utiliser *PostgreSQL*.

### Frontend

Pour le frontend, nous avons deux possibilités :

1) Vanilla JS
2) *Bootstrap toolkit*

Dans tous les cas, notre application doit être une sigle page (SPA) et le navigation avec les bouton *Back* et *Forward* doit être fonctionnel.

L'application doit être compatible avec la dernière version stable de *Google Chrome*.

L'utilisateur ne doit jamais rencontré d'erreur nos gérer lors de la visite de l'application.

### Docker

Tout le projet doit pouvoir se construire et se lancer en une seule commande. Nous devons utiliser *Docker* comme solution de containerisation et nous pouvons par exemple utiliser la commande `docker-compose up --build`.

Si nous choisissons de faire tourner *Docker* sous Linux, nous devons l’utiliser *rootless* pour des raisons de sécurité. Nous avons le choix de rendre le projet dans une VM.

### Le jeu

La fonctionnalité première de l'application et de pouvoir jouer a *Pong* contre d'autre joueur.

Pour ce faire, le joueur doit pouvoir jouer une partie de Pong contre un autre joueur. Le deux joueur utilise le même clavier.

Un joueur doit pouvoir jouer contre un autre, mais il doit aussi pouvoir prendre part à un tournois. Un tournois consiste en plusieurs joueurs qui s'affronte les un contre les autres en plusieurs partie afin de déterminer le meilleur joueur. Nous avons le choix pour l'architecture et les règles des tournois.

Nous devons mettre en place un système pour enregistrer les participants à un tournois. Chaque participant doit choisir un pseudo. Le pseudo sera reset à la fin du tournois.

Nous devons implémenter un système de matchmaking. Le matchmaking gère le tournois, c'est lui qui planifie les matches et annonce le début des matches au joueurs.

Tous les joueurs sont soumis au mêmes règles, se qui inclus avoir la même vitesse de déplacement.

### Sécurité

Tous les mot de passes que nous stockons doivent être chiffré. Nous devons choisir un algorithme robuste.

Le site web doit être protégé contre les *injection SQL et XSS*.

Si nous utilisons un backend, nous devons activé *HTTPS* pour tous les aspects.

Nous devons validés toutes les inputs saisis par l'utilisateur par exemple, pour les formulaire.

Il est crucial de priorisé la sécurité de l'application. Que se soit pour la partie minimal comme pour les modules additionnels.

Tous les credientials doivent être stocker en local et en aucun cas sur Git.

## ToCheck

- [ ] Django
- [ ] PostgreSQL
- [ ] VanillaJS
- [ ] Bootstrap toolkit
- [ ] Hasing algorithme
- [ ] Docker rootless
- [ ] websocket
- [ ] HTTPS

## Django

- [Site officiel - Django](https://www.djangoproject.com/)
- [Documentation - Django](https://docs.djangoproject.com/en/5.0/)
- [Wikipédia - Django](https://fr.wikipedia.org/wiki/Django_(framework))

*Django* est un framework MVC composé de trois partie distinctes:

1) Un language de gabarit qui permet de générer du HTML ou tout autre format texte.
2) Un contrôleur qui fait du remapping d'URL sur la base d'expression régulière.
3) Une API d'accès aux données est automatiquement générée par le framework pour le CRUD (**C**reate, **R**ead, **U**pdate, **D**elete). Nous n'avons pas besoin d'écrire des requêtes SQL car elle sont gérées par l'ORM.

En plus de l'API d'accès aux données, une interface d'administration fonctionnelle est générée depuis le modèle de données. Un système de validation des données entrées par l'utilisateur est également disponible et permet d'afficher des messages d'erreurs automatiquement.

En plus des ces points, Django inclut aussi:

- Un serveur web pour le développement et les testes.
- Un système de traitement des formulaire muni de widgets permettant d'interagir entre du HTML et une base de données. De nombreuses possibilités de contrôles et de traitement sont fournies.
- Un framework de cache pouvant utiliser différente méthode (MemCache, système de fichier, base de données, ..).
- Le support de classes intermédiaires (middleware) qui peuvent être placées à des stades variés du traitement des requêtes pour intégrer des traitements particulier (cache, internationalisation, ...).
- La prise en charge complète d'Unicode.

### MVC

- [Wikipédia - MVC](https://fr.wikipedia.org/wiki/Mod%C3%A8le-vue-contr%C3%B4leur)

MVC (**M**odèle, **V**ue, **C**ontrôleur) est un design d'architecture logiciel. Il définit trois types de modules qui

#### Modèle

Le modules qui traite les *données ainsi que leurs logique*. C'est lui qui à la charge de faire la validation, la lecture et l'enregistrement sur les données. Le *modèle* ne fait pas que interroger la base de données, il les manipule. C'est par exemple lui qui va appliquer la logique métier et validé les inputs de l'utilisateur.

#### Vue

Le module qui met en forme les données traitée par le *modèle*. La *vue* retourne une réponse textuelle formatée au besoin : HTML, XML, JSON. Par exemple, si l'utilisateur demande la liste de toute les utilisateurs au *contrôleur users*. Le *contrôleur* va demander au modèle la liste de tous les utilisateur et envoyé cette liste à la *vue* qui va se charger d'en faire une page HTML avec une liste qui contient toutes les utilisateurs.

#### Contrôleur

Le modules qui traite les *actions de l'utilisateur* et qui coordonne le *modèle* et la *vue* afin de retourner une réponse complète à l'utilisateur. C'est le *contrôleur* qui va vérifié si l'utilisateur à le droit de faire une certaine action. Par exemple, le *controleur* vérifie que l'utilisateur qui à demander de supprimer l'utilisateur avec l'id 42 et bien un administrateur. Dans le cas contraire il retourne une erreur 403.

#### Représentation

![Représentation de l'architecture MVC](assets/MVCDiag.png)

#### Exemples

|Méthode|Endpoint|Description|
|-------|--------|-----------|
|GET|`http://localhost/users/`|Demander au contrôleur *users* d'afficher la liste de tous les utilisateurs.|
|GET|`http://localhost/users/<int:user_id>/`|Demande au contrôleur *users* d'afficher un utilisateur unique en fonction de *user_id*.|
|POST|`http://localhost/users/`|Demande au contrôleur *users* de créer un utilisateur avec les informations dans le corps de la requête POST.|
|PUT|`http://localhost/users/<int:user_id>`|Demande au contrôleur *users* de mettre à jour les informations de l'utilisateur correspondant à *user_id* avec les informations dans le body de la requête PUT.|
|DELETE|`http://localhost/users/<int:user_id>/`|Demande au contrôleur *users* de supprimer l'utilisateur à qui correspond *user_id*.|

### ORM

- [ORM - Wikipédia](https://fr.wikipedia.org/wiki/Mapping_objet-relationnel)

*ORM* (**O**bject-**R**elational **M**apping) est un type de programme informatique qui fait l'interface entre un programme et une base de donnée relationnelle pour simuler une base de données orientée objet. Ce programme créer des correspondances entre un schéma de base de donnée est une classe dans l'application.

L'*ORM* permet donc de connecté notre application Django à n'importe quel base de donnée relationnel facilement est rapidement. La définition de nos tables ainsi que ces champs en base de données sont créer en fonction de classe qui hérite de models.

```python
from django.db import models

class CustomUser(models.Model):
	first_name = models.CharField(max_length=30)
	last_name = models.CharField(max_length=30)

	def __str__(self):
		return f"{self.first_name} {self.last_name}"

```

Cette exemple définit une class *CustomUser* qui comporte un champ *first_name* ainsi qu'un champ *last_name*. Dans la base de donnée, l'*ORM* va créer une table nommé *customuser* avec deux champ *VARCHAR* de taille 30. Lorsque nous demandons à l'*ORM* de nous retourner les informations sur un utilisateur, il va nous retourner des instances de *CustomUser* peuplée avec les information reçue depuis la base de donnée.

Vu que l'*ORM* fait l'abstraction entre notre application et la base de données, il est très facile de faire une configuration de dev qui va interagir avec une base SQLite local et une configuration de prod qui va interroger la base de données Postgres de production.

### Installation

- [Doc - Django install](https://docs.djangoproject.com/en/5.0/intro/install/)

Afin de pouvoir installer *Django*, il faut absolument avoir Python d'installer ainsi que pip.

Si tous les prérequis sont installé, activez l'environnement virtuel est utiliser la commande suivante afin d'installer Django :

```bash
$> python -m pip install Django
```

Pour vérifié que l'installation de Django c'est bien déroulé, nous pouvons lancer l’interpréteur Python (`python`) et constater que nous avons la bonne version installé :

```python
>>> import django
>>> print(django.get_version())
5.0.6
```

Si vous voyez un numéro de version, c'est que l'installation est complète.

Vous pouvez aussi directement utiliser la commande suivante :

```text
$> python -m django --version

5.0.6
```

#### Python

vous devez absolument avoir python d'installer sur votre système afin de pouvoir utiliser Django.

[Ici](https://docs.djangoproject.com/en/5.0/faq/install/#faq-python-version-support) il y a la liste des version de python supporté par Django et ici la [page de téléchargement de Python](https://www.python.org/downloads/)

#### Pip

Si vous n'avez pas *pip* d'installer sur votre distribution, le plus facile est d'installer [standalone pip installer](https://pip.pypa.io/en/latest/installation/)

#### venv

- [Doc - Python venv](https://docs.python.org/3/tutorial/venv.html)

*venv* est un outil intégré a Python afin de créer des environnement virtuel isolé pour les projet Python. Il permet de gérer les dépendances de projets Python plus efficacement et plus proprement.

Grâce à *venv*, nous allons pouvons installer des modules Python dans l'environnement virtuel et il ne seront disponible nul par ailleurs. Nous n'allons donc pas polluer notre environnent principal ni l'environnent des autres projets.

Pour créer un environnement virtuel, il faut se rendre à la racine de notre projet et utiliser la commande `python3 -m venv <envname>`.

Si vous avez le message suivant, procéder à l'installation avec `apt install python<version>-venv`

```text
The virtual environment was not created successfully because ensurepip is not
available.  On Debian/Ubuntu systems, you need to install the python3-venv
package using the following command.

    apt install python3.10-venv

You may need to use sudo with that command.  After installing the python3-venv
package, recreate your virtual environment.

Failing command: /home/luca/Git/djangoTuto/djangoTuto/bin/python3
```

Si la création du nouvel environment virtuel c'est dérouler correctement, vous devriez voir un dossier portant le nom de l’environnement à la racine du projet.

Maintenant que nous avons créer notre environnement de travail virtuel, nous devons l'activé afin de pouvoir travail avec. L'activer signifie "se connecter à". Pour se faire, nous allons utiliser la commande `source <env_name>/bin/activate`. Maintenant, vous devriez voir votre prompte changer pour notifié que vous êtes bien à l'intérieur de l'environnement virtuel.

Pour quitter l'environnement, il suffit d'entré la commande `deactivate`.

Pour installer des modules dans l’environnement, il suffit de s'y connecter et d'installer le module normalement via pip.

### Création d'un projet

- [Tutoriel - Django](https://docs.djangoproject.com/en/5.0/intro/tutorial01/)

Maintenant que Django est installé, nous allons pouvoir créer un projet. Afin de découvrir Django et d'avoir une guide line, je vais suivre et détailler le tutoriel de la documentation officiel.

Nous allons donc pouvoir créer notre premier projet Django avec la commande suivante :

```text
$> django-admin startproject <project_name>
```

Cette commande va créer un dossier <project_name> qui contiendra la configuration initiale de notre projet Django. Pour ce tutoriel, je vais appeler mon projet Django de la même manière de que le repos Git, "djangoTuto".

```bash
(djangoTuto-env) ➜  djangoTuto git:(main) ✗ ls
djangoTuto  djangoTuto-env
(djangoTuto-env) ➜  djangoTuto git:(main) ✗ tree djangoTuto
djangoTuto
├── djangoTuto
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
└── manage.py

1 directory, 6 files
```

- Le dossier **djangoTuto/** est le répertoire root de notre application. Nous pouvons le renommer comme nous voulons, cela n'a aucune importance pour Django.
- Le fichier **manage.py** est un utilitaire en ligne de commande qui permet d'interagir avec notre projet Django. Plus d'informations [ici](https://docs.djangoproject.com/en/5.0/ref/django-admin/).
- Le dossier **djangoTuto/djangoTuto** est le dossier pour le module Python actuel de notre application. Sont nom est le nom du projet et ne doit pas être modifié.
- Le fichier **djangoTuto/__init__.py** est un fichier vide qui indique à Django que le répertoire doit être considéré comme un Package Python.
- Le fichier **djangoTuto/settings.py** contient les configurations de notre projet Django. Plus d'information [ici](https://docs.djangoproject.com/en/5.0/topics/settings/).
- Le fichier **djangoTuto/urls.py** contient les différents urls de notre projet ainsi que les actions qui leurs sont liée. Plus d'informations [ici](https://docs.djangoproject.com/en/5.0/topics/http/urls/).
-
