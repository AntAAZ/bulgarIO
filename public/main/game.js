/// establishing socket connection
var socket = io();

var bloops = new Map(),
    leaderboard = new Map(),
    mapSize, playerSize,
    foods = [], zoom = 1;

function setup() {
    createCanvas(innerWidth, innerHeight);

    /// spawning the player
    socket.emit('spawn');
}

function draw() {

    background(0); /// sets the background color to black

    /// show something else while the socket is being initialized
    if (!socket.connected) {
        showLoadingScreen('Connecting...');
        return;
    }

    if (!bloops.has(socket.id)) {
        return;
    }

    let mybloop = bloops.get(socket.id);

    showCoordinates({
        'x': mybloop.pos.x,
        'y': mybloop.pos.y
    });

    showLeaderboard(10);

    translate(width / 2, height / 2);
    zoom = lerp(zoom, playerSize / mybloop.radius, 0.1);
    scale(sqrt(zoom));
    translate(-mybloop.pos.x, -mybloop.pos.y);

    /// interating through the foods
    foods.filter(food => mybloop.has_visibility_for(food, sqrt(zoom))).forEach(function (food) {
        food.show();
        if (mybloop.intersects(food) && mybloop.radius > food.radius) {

            let index = foods.findIndex(function (target) {
                return food === target;
            });

            mybloop.eat(food);

            socket.emit('updateFood', {
                'index': index
            });
        }
    });

    /// iterating through the map of clients to draw them & handle collision checks
    bloops.forEach(function (bloop) {
        /// do this only when we can see the other player
        if (mybloop.has_visibility_for(bloop, sqrt(zoom))) {
            bloop.show();
            /// eat another bloop only if you are 25% bigger
            if (mybloop.intersects(bloop)) {
                let radius_ratio = mybloop.radius / bloop.radius;

                if (radius_ratio > 1.25) {
                    mybloop.eat(bloop);
                } else if (1 / radius_ratio > 1.25) {
                    bloop.eat(mybloop);
                }
            }
        }
    });

    mybloop.update(); /// updates the new coordinates of your player object
    mybloop.constrain(); /// keeps your player object inside the map

    bloops.set(socket.id, mybloop); /// inserts your player object with the updated properties

    /// sending your new client data to the server
    socket.emit('update', {
        'id': mybloop.id,
        'x': mybloop.x,
        'y': mybloop.y,
        'color': mybloop.color,
        'posx': mybloop.pos.x,
        'posy': mybloop.pos.y,
        'radius': mybloop.radius
    });
}

/// on canvas resize
function windowResized() {
    resizeCanvas(innerWidth, innerHeight);
}

/// show when some data needs more time to process
function showLoadingScreen(message) {
    textFont("Courier New");
    textSize(innerWidth / 30);
    textAlign(CENTER);

    fill(255);
    text(message, innerWidth / 2, innerHeight / 5);

}

/// a function to show the leaderboard (To do better)
function showLeaderboard(limit) {

    let index = 0,
        entries = [],
        sorted_leaderboard;

    for (var entry of leaderboard) {
        entries.push(entry);
    }

    entries.sort(function (a, b) {
        return parseInt(a[1]) < parseInt(b[1]);
    });

    sorted_leaderboard = new Map(entries);

    textFont("Courier New");
    textAlign(RIGHT);
    sorted_leaderboard.forEach(function (value, key) {
        textSize(25);
        fill(170);

        if (key == socket.id) {
            fill(color([255, 215, 0]));
        }
        text(`${key}  ---  ${floor(value)}`, innerWidth - 25, (++index) * 30 + 10);

        if (index == limit) {
            return;
        }
    });
}

/// a function to show a player's coordinates (To do better)
function showCoordinates(data) {
    textFont("Courier New");
    textSize(25);
    textAlign(LEFT);

    fill(color([240, 230, 140]));
    text(`<${floor(data.x)},${floor(data.y)}>`, 50, 50);
}
