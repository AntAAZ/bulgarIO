class Food {

    constructor(x, y, radius, col) {
        this.color = col;
        this.radius = radius;
        this.pos = createVector(x, y);
    }

    show() {
        fill(color(this.color));
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }

};

class Bloop extends Food {

    constructor(x, y, radius, col, id) {
        super(x, y, radius, col);
        this.id = id;
        this.vel = createVector(0, 0);
    }

    eat(other) {

        this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 2));

        if (other instanceof Bloop) {
            socket.emit('eat', {
                'id': other.id,
                'color': other.color
            });
        }
        socket.emit('leaderboard', this.radius);
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
