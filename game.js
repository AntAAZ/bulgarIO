/// TO:DO -> move classes/global constants into other files
var socket, mybloop, foods, zoom = 1,
    mapSize = 10000,
    bloopSize = 64,
    bloops = new Map();

class Food {

    constructor(x, y, radius, col) {
        this.color = col;
        this.radius = radius;
        this.pos = createVector(x, y);
    }

    /// a function that draws the object
    show() {
        fill(color(this.color));
        ellipse(this.pos.x, this.pos.y, this.radius * 2, this.radius * 2);
    }

};

/*   x & y are the coords for the starting position
	 pos.x & pos.y are the actual coords	*/

class Bloop extends Food {

    constructor(x, y, radius, col, id) {
        super(x, y, radius, col);
        this.id = id; /// each bloop has identifier
        this.vel = createVector(0, 0); /// and velocity
    }

    eat(other) {
        this.radius = sqrt(pow(this.radius, 2) + pow(other.radius, 2));

        if (other instanceof Bloop) {
            socket.emit('eat', {
                'id': other.id
            });
        }
    }

    intersects(other) {
        return this.radius + other.radius > p5.Vector.dist(this.pos, other.pos);
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
        var new_velocity = createVector(mouseX - width / 2, mouseY - height / 2);
        new_velocity.setMag(10);
        this.vel.lerp(new_velocity, 0.2);
        this.pos.add(this.vel);
    }
};
/// on canvas resize
function windowResized() {
    resizeCanvas(innerWidth - 4, innerHeight - 4);
}

/// show when some data needs more time to process
function showLoadingScreen(message) {
    textFont("Courier New");
    textSize(innerWidth / 30);
    textAlign(CENTER);

    fill(255);
    text(message, innerWidth / 2, innerHeight / 5);
}
/// a function to show a player's coordinates
function showCoordinates(data) {
    textFont("Courier New");
    textSize(innerWidth / 75);
    textAlign(LEFT);

    fill(255);
    text(`<${floor(data.x)},${floor(data.y)}>`, 50, 50);
}


function setup() {
    /// generating the canvas
    createCanvas(innerWidth - 4, innerHeight - 4);

    /// connecting the player
    socket = io.connect('http://localhost:3000');

    /// generating your player object (x : float, y : float, color : array[3], id : string)
    mybloop = new Bloop(random(-mapSize, mapSize), random(-mapSize, mapSize), bloopSize, [random(100, 256), random(100, 256), random(200, 256)], socket.id);

    /// inserting your player object into your map of clients
    bloops.set(socket.id, mybloop);

    /// setting foods for you
    socket.on('spawnFoods', function(data) {
        foods = [];
        for (var i = 0; i < data.length; i++) {
            foods[i] = new Food(data[i].x, data[i].y, bloopSize / 4, data[i].color);
        }
    });

    /// sending your client data to the server
    socket.emit('update', {
        'id': socket.id,
        'x': mybloop.x,
        'y': mybloop.y,
        'radius': mybloop.radius,
        'color': mybloop.color
    });

    /// respawning the clients that got eaten for you on eat (socket.broadcast.emit on the server side)
    socket.on('respawn', function(data) {
        var bloop = new Bloop(random(-mapSize, mapSize), random(-mapSize, mapSize), bloopSize, [random(100, 256), random(100, 256), random(200, 256)], data.id);

        //console.log(`Updating for you(${socket.id}) -> Respawning ${bloop.id} at => ${bloop.x}:${bloop.y}`);

        bloops.set(data.id, bloop);
    });

    /// updating the coordinates of the other clients for you on update (socket.broadcast.emit on the server side)
    socket.on('update', function(data) {
        var bloop = new Bloop(data.x, data.y, data.radius, data.color, data.id);
        bloop.pos = createVector(data.posx, data.posy);

        //console.log(`Updating for you(${socket.id}) -> Setting coordinates for ${data.id} => ${data.posx}:${data.posy}`);

        bloops.set(data.id, bloop);
    });

    /// removes the food from your array of foods
    socket.on('removeFood', function(data) {
        foods.splice(data.index, 1);
    });

    /// deleting a client from your map of clients on disconnection (socket.broadcast.emit on the server side)
    socket.on('delete', function(data) {
        //console.log(`Updating for you(${socket.id}) -> Removing ${data.id} client from your map of clients`);
        bloops.delete(data.id);
    });
}

function draw() {

    background(0); /// sets the background color to black

    if (!(foods instanceof Array)) {
        showLoadingScreen('loading food/bloops ...');
        return;
    }
    showCoordinates({
        'x': mybloop.pos.x,
        'y': mybloop.pos.y
    });
    /// the player sees themselves at the center of the canvas and other objects within range //
    translate(width / 2, height / 2);
    zoom = lerp(zoom, bloopSize / mybloop.radius, 0.1);
    scale(zoom);
    translate(-mybloop.pos.x, -mybloop.pos.y);
    ////////////////////////////////////////////////////////////////////////////////////////////

    /// interating through the foods
    foods.filter(food => mybloop.has_visibility_for(food, zoom)).forEach(function(food) {
        food.show();
        if (mybloop.intersects(food) && mybloop.radius > food.radius) {

            let index = foods.findIndex(function(target) {
                return food === target;
            });

            mybloop.eat(food);
            foods.splice(index, 1);
            socket.emit('removeFood', {
                'index': index
            });
        }
    });

    /// iterating through the map of clients to draw them & handle collision checks
    bloops.forEach(function(bloop) {
        /// do this only when we can see the other player
        if (mybloop.has_visibility_for(bloop, zoom)) {
            bloop.show();
            /// eat another bloop only if you are 25% bigger
            if (mybloop.intersects(bloop) && mybloop.radius / bloop.radius > 1.25) {
                mybloop.eat(bloop);
            }
        }
    });

    /// syncs the changes on your client's data (located in your clients' map) with your player object
    Object.assign(mybloop, bloops.get(socket.id));

    mybloop.update(); /// updates the new coordinates of your player object
    mybloop.constrain(); /// keeps your player object inside the map

    bloops.set(socket.id, mybloop); /// inserts your player object with the updated properties


    /// sending your new client data to the server
    socket.emit('update', {
        'id': socket.id,
        'x': mybloop.x,
        'y': mybloop.y,
        'posx': mybloop.pos.x,
        'posy': mybloop.pos.y,
        'radius': mybloop.radius,
        'color': mybloop.color
    });
}
