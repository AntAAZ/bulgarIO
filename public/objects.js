class Food {

    constructor(x, y, radius, col) {
        this.color = col;
        this.radius = radius;
        this.pos = createVector(x, y);
    }

    show() {
        noStroke();
        fill(this.color);
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }

};

class Bloop extends Food {

    constructor(x, y, radius, col, username, id) {
        super(x, y, radius, col);
        this.id = id;
        this.username = username;
        this.vel = createVector(0, 0);
    }

    eat(other) {


        if (other instanceof Bloop) {
            socket.emit('eat', {
                'id': other.id,
                'username': other.username,
                'color': other.color
            });
            this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 2));
        } else {
            this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 1.5));
        }

        socket.emit('leaderboard', {
            username: this.username,
            score: this.radius
        });
    }

    showName() {
        textFont("Courier New");
        textSize(this.radius / 2);
        textAlign(CENTER);

        fill(100);
        text(this.username, this.pos.x, this.pos.y + this.radius / 4);
    }

    intersects(other) {
        return this.radius + other.radius / 2 > p5.Vector.dist(this.pos, other.pos);
    }

    constrain() {
        this.pos.x = constrain(this.pos.x, -mapSize, mapSize);
        this.pos.y = constrain(this.pos.y, -mapSize, mapSize);
    }

    has_visibility_for(other, zoom) {
        return other.pos.x * zoom + other.radius > this.pos.x * zoom - width / 2 &&
            other.pos.x * zoom - other.radius < this.pos.x * zoom + width / 2 + this.radius &&
            other.pos.y * zoom + other.radius > this.pos.y * zoom - height / 2 &&
            other.pos.y * zoom - other.radius < this.pos.y * zoom + height / 2 + this.radius;
    }

    update() {
        let new_velocity = createVector(mouseX - width / 2, mouseY - height / 2);
        new_velocity.setMag(10 * (sqrt(zoom)));
        this.vel.lerp(new_velocity, 0.2);
        this.pos.add(this.vel);
    }
};
