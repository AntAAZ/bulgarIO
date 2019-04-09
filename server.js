let express = require('express');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require("path");
const config = require('./config');

const mapSize = config.mapSize,
    foodSize = config.food.size,
    foodColor = config.food.color,
    playerColor = config.player.color,
    playerSize = config.player.size,
    foodsAmount = config.food.amount;

let bloops = new Map(),
    leaderboard = new Map(),
    foods = [];

/// routes
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/main/index.html'));
});
app.get('/game.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/main/game.js'));
});
app.get('/events/events.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/events/events.js'));
});
app.get('/api/objects.js', function (req, res) {
    res.sendFile(path.join(__dirname + '/public/api/objects.js'));
});

function objectInit(colorProperty) {
    let gameObject = {
        'x': -mapSize + Math.random() * mapSize * 2,
        'y': -mapSize + Math.random() * mapSize * 2,
        'radius': colorProperty === playerColor ? playerSize : foodSize,
        'color': [colorProperty.red[0] + Math.random() * (colorProperty.red[1] - colorProperty.red[0]),
            colorProperty.green[0] + Math.random() * (colorProperty.green[1] - colorProperty.green[0]),
            colorProperty.blue[0] + Math.random() * (colorProperty.blue[1] - colorProperty.blue[0])]
    }
    gameObject.posx = gameObject.x;
    gameObject.posy = gameObject.y;
    return gameObject;
}

for (let i = 0; i < foodsAmount; i++) {
    foods.push(objectInit(foodColor));
}

io.on('connection', function (socket) {

    console.log(`ID ${socket.id} connected!`);

    socket.emit('init', {
        'foods': foods,
        'mapSize': mapSize,
        'playerSize': playerSize
    });

    leaderboard.forEach(function (value, key) {
        socket.emit('leaderboard', {
            'id': key,
            'score': value
        });
    });

    socket.on('spawn', function () {
        let bloop = objectInit(playerColor);
        bloop.id = socket.id;
        bloops.set(bloop.id, bloop);
        leaderboard.set(bloop.id, bloop.radius);
        io.emit('spawn', bloop);
    })

    socket.on('update', function (data) {
        bloops.set(data.id, {
            'id': data.id,
            'x': data.x,
            'y': data.y,
            'posx': data.posx,
            'posy': data.posy,
            'radius': data.radius,
            'color': data.color
        });
        socket.broadcast.emit('update', data);
    });
    socket.on('leaderboard', function (score) {
        leaderboard.set(socket.id, score);

        io.emit('leaderboard', {
            'id': socket.id,
            'score': score
        });
    });
    socket.on('eat', function (data) {
        let bloop = objectInit(playerColor);
        bloop.id = data.id;
        bloops.set(bloop.id, bloop);
        leaderboard.set(bloop.id, bloop.radius);
        io.emit('spawn', bloop);
    });
    socket.on('updateFood', function (data) {
        foods[data.index] = objectInit(foodColor);

        io.emit('updateFood', {
            'index': data.index,
            'initializer': foods[data.index]
        });
    });

    socket.on('disconnect', function () {
        bloops.delete(socket.id);
        leaderboard.delete(socket.id);
        socket.broadcast.emit('delete', {
            'id': socket.id
        });
        console.log(`ID ${socket.id} disconnected!`);
    });
});


http.listen(config.serverPort, function () {
    console.log("server started on port 3000");
});
