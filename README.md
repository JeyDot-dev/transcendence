# Transcendance

Welcome to **Transcendance**, a school project developed by a team of five passionate students: **lsohler**, **lray**, **jchapell**, **mde-sepi**, and **jsousa-a**.

---

## 🎮 What is Transcendance?

Transcendance is a multiplayer web-based game inspired by the classic Pong, reimagined with modern 3D graphics and interactive features.

---

## ✨ Features

- **3D Pong Gameplay**: A modern twist on the classic Pong game with 3D graphics powered by Three.js.
- **Multiplayer Support**: Play with friends locally or online.
- **Customizable Settings**: Adjust game parameters like timer, points to win, and spin mechanics.
- **Dynamic UI**: A responsive and user-friendly interface built with Bootstrap.
- **User Profiles**: Track your game history, victories, and more.
- **Tournament Mode**: Compete in local tournaments to crown a champion.
- **Real-Time Updates**: Smooth gameplay with real-time interactions using WebSockets.
- **Scalable and fully containerized**: Using docker compose and separating every service in it's own container.
- \[In a separate branch\] **Logs managament**: Full ELK stack setup with lifecycle management.

---

## 🛠️ Technologies Used

- **Frontend**: Three.js, JavaScript, HTML, CSS, Bootstrap
- **Backend**: Django, Channels, Daphne, Gunicorn, Redis
- **Database**: PostgreSQL
- **Containerization**: Docker and Docker Compose
- **Version Control**: Git and GitHub
- **Log management**: ELK stack (Elasticsearch, Logstash, Kibana)

---

## 🚀 How to Run the Project

### Prerequisites

1. Install [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/).
2. \[optional\] Makefile

### Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/JeyDot-dev/transcendence.git
   cd transcendence
   ```
2. Set up environment:
   ```bash
   cp example.env .env
   ```
   edit .env with new credentials
3. docker-compose up
4. wait for nginx to start
5. connect open browser and connect to https://localhost:443

---

## 📂 Project Structure
```
.
├── containers/
│   ├── daphne/
│   ├── django/
│   ├── gunicorn/
│   ├── nginx/
│   └── postgres/
├── project/
│   ├── database/
│   ├── pong/
│   │   ├── static/
│   │   ├── templates/
│   │   └── threejs/
│   ├── userManager/
│   └── manage.py
├── docker-compose.yml
├── .env
├── Makefile
└── README.md
```

---

## 🧑‍💻 Team Members
- lsohler: Game mechanics, 3D, Real-time communication with Websockets.
- lray: Custom SPA rendering using vanilla JS, custom routing.
- jchapell: User management front-end and API.
- mde-sepi: Tournament system, database design.
- jsousa-a: project architecture (devOps, containerization), UI, Log monitoring.

---

## 📚 Lessons Learned
This project taught us how to:

- Collaborate effectively in a team environment.
- Integrate 3D graphics into a web application.
- Build scalable and containerized applications using Docker.
- Implement real-time features with Django Channels.
