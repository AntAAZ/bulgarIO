/// TO:DO -> move classes/global constants into other files
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

var bloops = new Map(),
    leaderboard = new Map(),
    foods = [],
    mapSize = 25000;

for (let i = 0; i < mapSize; i++) {

    foods.push({
        'x': -mapSize + Math.random() * mapSize * 2,
        'y': -mapSize + Math.random() * mapSize * 2,
        'color': [100 + Math.random() * 156, 100 + Math.random() * 156, 200 + Math.random() * 56]
    });
}

io.on('connection', function(socket) {

    console.log(`ID ${socket.id} connected!`);
    socket.emit('init', foods);

    leaderboard.forEach(function(value, key) {
        socket.emit('leaderboard', {
            'id': key,
            'score': value
        });
    });

    socket.on('update', function(data) {
        if (data.id != undefined) {
            bloops.set(data.id, {
                'id': data.id,
                'x': data.x,
                'y': data.y,
                'posx': data.posx,
                'posy': data.posy,
                'color': data.color,
                'radius': data.radius
            });
            socket.broadcast.emit('update', data);
        }
    });
    socket.on('leaderboard', function(score) {
        leaderboard.set(socket.id, score);

        socket.broadcast.emit('leaderboard', {
            'id': socket.id,
            'score': score
        });
    });
    socket.on('eat', function(data) {
        if (data.id != undefined) {
            console.log(`ID ${data.id} was eaten! Respawning...`);

            let bloop = {
                'x': -mapSize + Math.random() * mapSize * 2,
                'y': -mapSize + Math.random() * mapSize * 2,
                'radius': 50,
                'color': data.color,
                'id': data.id
            };

            bloop.posx = bloop.x;
            bloop.posy = bloop.y;

            io.emit('update', bloop);
        }
    });
    socket.on('removeFood', function(data) {
        if (data.index != undefined) {
            foods.splice(data.index, 1);

            //console.log(`ID ${socket.id} grew up by eating food!`);

            socket.broadcast.emit('removeFood', data);
        }
    });

    socket.on('disconnect', function() {

        bloops.delete(socket.id);
        leaderboard.delete(socket.id);

        console.log(`ID ${socket.id} disconnected!`);

        socket.broadcast.emit('delete', {
            'id': socket.id
        });
    });
});


http.listen(3000, function() {
    console.log("server started on port 3000");
});
