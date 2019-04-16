let express = require('express');
let session = require('express-session');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');
let config = require('./config/config');
let dbconfig = require('./config/dbcon');

let passport = require('passport');
let flash = require('connect-flash');
require('./passport')(passport);

app.set('views', __dirname + '/views');
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.set('view engine', 'ejs');

app.use(session({
    secret: 'justasecret',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static('public'));
require('./route')(app, passport);

const mapSize = config.mapSize,
    foodSize = config.food.size,
    foodColor = config.food.color,
    playerColor = config.player.color,
    playerSize = config.player.size,
    foodsAmount = config.food.amount;

let bloops = new Map(),
    leaderboard = new Map(),
    foods = [];

function objectInit(colorProperty) {
    let gameObject = {
        'x': -mapSize + Math.random() * mapSize * 2,
        'y': -mapSize + Math.random() * mapSize * 2,
        'radius': colorProperty === playerColor ? playerSize : foodSize,
        'color': [colorProperty.red[0] + Math.random() * (colorProperty.red[1] - colorProperty.red[0]),
            colorProperty.green[0] + Math.random() * (colorProperty.green[1] - colorProperty.green[0]),
            colorProperty.blue[0] + Math.random() * (colorProperty.blue[1] - colorProperty.blue[0]),
            colorProperty.alpha[0] + Math.random() * (colorProperty.alpha[1] - colorProperty.alpha[0])]
    }
    gameObject.posx = gameObject.x;
    gameObject.posy = gameObject.y;

    if(colorProperty == foodColor){
        gameObject.index
    }
    return gameObject;
}

io.on('connection', function (socket) {
    console.log(`ID ${socket.id} connected!`);
    socket.emit('init', {
        'foods': foods,
        'mapSize': mapSize,
        'playerSize': playerSize
    });

    leaderboard.forEach(function (value, key) {
        if(value !== undefined){
            socket.emit('leaderboard', {
                'id': key,
                'username': value.username,
                'score': value.score
            });
        }
    });

    socket.on('spawn', function (username) {
        let bloop = objectInit(playerColor);
        bloop.id = socket.id;
        bloop.username = username;
        bloops.set(bloop.id, bloop);

        let data = {
            username: bloop.username,
            score: bloop.radius
        }

        leaderboard.set(bloop.id, data);
        io.emit('spawn', bloop);
    });

    socket.on('update', function (data) {
        bloops.set(data.id, {
            'id': data.id,
            'username': data.username,
            'x': data.x,
            'y': data.y,
            'posx': data.posx,
            'posy': data.posy,
            'radius': data.radius,
            'color': data.color
        });
        socket.broadcast.emit('update', data);
    });
    socket.on('leaderboard', function (data) {
        data.id = socket.id;
        leaderboard.set(socket.id);
        io.emit('leaderboard', data);
    });
    socket.on('eat', function (data) {
        let bloop = objectInit(playerColor);
        bloop.id = data.id;
        bloop.username = data.username;

        bloops.set(bloop.id, bloop);

        leaderboard.set(bloop.id, {
            username: bloop.username,
            score: bloop.radius
        });
        io.emit('spawn', bloop);
    });
    socket.on('eatFood', function (data) {
        foods.splice(data.index, 1);

        socket.broadcast.emit('eatFood', {
            'index': data.index
        });
    });
    socket.on('disconnect', function () {
        bloops.delete(socket.id);
        leaderboard.delete(socket.id);

        io.emit('delete', {
            'id': socket.id
        });
        console.log(`ID ${socket.id} disconnected!`);
    });
    function spawnFoods(){
        if(foods.length >= foodsAmount){
            return;
        }

        let food = objectInit(foodColor);
        foods.push(food);

        io.emit('addFood', {
            'initializer': food
        });
    }
    setInterval(spawnFoods, 100);
});


http.listen(config.serverPort, function () {
    console.log("server started on port 3000");
});
