# pong/game_objects.py

class Paddle:
    def __init__(self, x, y, width, height, canvas_height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.canvas_height = canvas_height

    def move(self, new_y):
        self.y = new_y
        if self.y < 0:
            self.y = 0
        elif self.y + self.height > self.canvas_height:
            self.y = self.canvas_height - self.height

    def is_ball_approaching(self, ball):
        paddle_x = self.x  # Position x du paddle
        paddle_width = self.width  # Largeur du paddle
        ball_x = ball.x  # Position x de la balle

        # Vérifier si la balle se trouve dans la plage définie par le paddle +/- 10
        return paddle_x - paddle_width - 10 <= ball_x <= paddle_x + paddle_width + 10


    def handle_collision_left(self, ball):
        if (ball.x - ball.radius <= self.x + self.width and
            self.y <= ball.y <= self.y + self.height):
            # Collision détectée sur le côté gauche du paddle
            ball.speed_x = abs(ball.speed_x)  # Inverser la direction horizontale de la balle
            # Calculer le changement de vitesse vertical basé sur la position de la collision
            hit_position = (ball.y - self.y) / self.height
            ball.speed_y = (hit_position - 0.5) * 10  # Ajustez ce facteur selon vos besoins

    def handle_collision_right(self, ball):
        if (ball.x + ball.radius >= self.x and
            self.y <= ball.y <= self.y + self.height):
            # Collision détectée sur le côté droit du paddle
            ball.speed_x = -abs(ball.speed_x)  # Inverser la direction horizontale de la balle
            # Calculer le changement de vitesse vertical basé sur la position de la collision
            hit_position = (ball.y - self.y) / self.height
            ball.speed_y = (hit_position - 0.5) * 10  # Ajustez ce facteur selon vos besoins



class Ball:
    def __init__(self, x, y, radius, speed_x, speed_y, canvas_width, canvas_height):
        self.x = x
        self.y = y
        self.radius = radius
        self.speed_x = speed_x
        self.speed_y = speed_y
        self.canvas_width = canvas_width
        self.canvas_height = canvas_height

    def move(self):
        self.x += self.speed_x
        self.y += self.speed_y

        if self.y - self.radius < 0 or self.y + self.radius > self.canvas_height:
            self.speed_y = -self.speed_y

    def reset(self):
        self.x = self.canvas_width / 2
        self.y = self.canvas_height / 2
        self.speed_x = -self.speed_x
        self.speed_y = 5  # Reset the speed_y or any default value
