var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static('public'));

http.listen(3000, function(){
    console.log("server started on port 3000");
});

/// io.sockets.emit -> sends the event to all sockets
/// socket.emit -> sends the event to a single socket

io.on('connection', function (socket) {
	console.log(socket.id, "connected");

	socket.on('disconnect', function (){
		console.log(socket.id, "disconnected");
	});
});

