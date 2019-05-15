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

    constructor(x, y, radius, col, speed, username, id) {
        super(x, y, radius, col);
        this.id = id;
        this.speed = speed;
        this.username = username;
        this.vel = createVector(0, 0);
    }

    eat(other) {

        if(other instanceof PowerUp){
            if(other.name == "speed+"){
                this.speed *= 1.25;
            }
            else if(other.name == "speed-"){
                this.speed /= 1.25;
            }
            else if(other.name == "size+"){
                this.radius *= 1.25;
            }
            else if(other.name == "size-"){
                this.radius /= 1.25;
            }
            else if(other.name == "teleport"){
                this.pos.x += this.vel.x*this.speed*20;
                this.pos.y += this.vel.y*this.speed*20;
            }
            /////
            this.updateOnLeaderboard({
                username: this.username,
                score: this.radius
            });
            return;
        }

        if (other instanceof Bloop) {
            socket.emit('eat', {
                'id': other.id,
                'username': other.username,
                'color': other.color
            });
            this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 2));
        } else if(other instanceof Food){
            this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 1.5));
        }

    }
    updateOnLeaderboard(data){
        leaderboard.set(this.id, data);
        socket.emit('leaderboard', data);
    }
    showName() {
        textFont("Courier New");
        textSize(this.radius / 2);
        textAlign(CENTER);

        fill(255);
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
        new_velocity.setMag(this.speed * zoom);
        this.vel.lerp(new_velocity, 0.2);

        if(mouseX > width/2-20 && mouseX < width/2+20 && mouseY > height/2-20 && mouseY < height/2+20){
            this.vel = createVector(0, 0);
        }
        this.pos.add(this.vel);
        if(Math.random()<0.03){
            let stepColor = color(this.color);
            stepColor.setAlpha(20);
            steps.push(new Step(this.pos.x, this.pos.y, this.radius/2, stepColor));
            socket.emit('sendStep', {
                'x': this.pos.x,
                'y': this.pos.y,
                'radius': this.radius/2,
                'color': [red(stepColor), green(stepColor), blue(stepColor), alpha(stepColor)]
            });
        }
        let updatedStats = {
            'x': this.x,
            'y': this.y,
            'color': this.color,
            'speed': this.speed,
            'posx': this.pos.x,
            'posy': this.pos.y,
            'radius': this.radius,
            'username': this.username,
            'id': this.id
        };
        Object.assign(this, updatedStats);
        socket.emit('update', updatedStats);
    }

};

class PowerUp extends Food {
    constructor(x, y, radius, col, name) {
        super(x, y, radius, col);
        this.name = name;
        this.pos = createVector(x, y);
    }
    showType(){
        textFont("Courier New");
        textSize(this.radius / 1.5);
        textAlign(CENTER);

        fill(255);
        text(this.name, this.pos.x, this.pos.y + this.radius / 4);
    }
};

class Step extends Food {
    constructor(x, y, radius, col) {
        super(x, y, radius, col);
    }
}

