var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static("public"));

var id = 0;
var list = [];
var freeSpots = [];//for big number of users better to use a heap
var data = {};
data.users = [];
io.on("connection", function(socket){
    var cid;
    if (freeSpots.length>0){
        minind = 0;
        for (var i=1; i<freeSpots.length; ++i){
            if (freeSpots[i]<freeSpots[minind]){
                minind = i;
            }
        }
        cid = freeSpots[minind];
        freeSpots.splice(minind, 1);
    }
    else{
        cid = id++;
    }
    console.log("connection from id: " + socket.id);
    
    list[cid] = 1;
    data.users[cid] = {};
    socket.emit("id", cid, data, list);
    io.emit("listCon", cid);
    
    socket.on("disconnect", function(){
        list[cid] = 0;
        freeSpots.push(cid);
        io.emit("listDiscon", cid);
    });
    
    socket.on("update", function(variable, value){
        data[variable] = value;
        socket.broadcast.emit("update", variable, value);
    });
    socket.on("updateForUser", function(user, variable, value){
        data.users[user][variable] = value;
        socket.broadcast.emit("updateForUser", user, variable, value);
    });
});

http.listen(3000, function(){
    console.log("server started on port 3000");
});
