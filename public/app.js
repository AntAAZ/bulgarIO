var socket = io();

socket.on("id", function(id, data, list) {
    sharedStorage.id = id;
    sharedStorage.data = data;
    sharedStorage.list = list;
    //starts the game when connection is established

    socket.on("listCon", function(id) {
        sharedStorage.list[id] = 1;
    });
    socket.on("listDiscon", function(id) {
        sharedStorage.list[id] = 0;
    });
    socket.on("update", function(variable, value) {
        sharedStorage.data[variable] = value;
    });
    socket.on("updateForUser", function(user, variable, value) {
        if (sharedStorage.data.users[user] == undefined) {
            sharedStorage.data.users[user] = {};
        }
        sharedStorage.data.users[user][variable] = value;
    });

    initGame();
    redraw();
    callupdate();
});


class SharedStorage {
    constructor() {
        this.list = [];
        this.data = {};
        this.data.users = [];
    }

    set(variable, value) {
        this.data[variable] = value;
        socket.emit("update", variable, value);
    }

    get(variable) {
        return this.data[variable];
    }

    setForUser(user, variable, value) {
        if (this.data.users[user] == undefined) {
            this.data.users[user] = {};
        }
        this.data.users[user][variable] = value;
        socket.emit("updateForUser", user, variable, value);
    }

    getForUser(user, variable) {
        if (this.data.users[user] == undefined) {
            this.data.users[user] = {};
        }
        return this.data.users[user][variable];
    }

    setForMe(variable, value) {
        this.setForUser(this.id, variable, value);
    }

    getForMe(variable) {
        return this.getForUser(this.id, variable);
    }
};
var sharedStorage = new SharedStorage();
var canvas = document.getElementById("canvas-id");
var context = canvas.getContext("2d");

// global variables with mouse coordinates
var mouseX = 0,
    mouseY = 0;

var reqAnimationFrame =
    window.requestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        setTimeout(callback, 1000 / 30);
    }

function redraw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = 1;

    draw();
    reqAnimationFrame(redraw);
}

function callupdate() {
    update();
    setTimeout(callupdate, 1);
}

function init() {
    window.addEventListener("mousemove", function(e) {
        mouseX = e.pageX - canvas.offsetLeft;
        mouseY = e.pageY - canvas.offsetTop;
    });

    if (typeof mousemove != "undefined") window.addEventListener("mousemove", mousemove);
    if (typeof mouseup != "undefined") window.addEventListener("mouseup", mouseup);
    if (typeof mousedown != "undefined") window.addEventListener("mousedown", mousedown);
    if (typeof keydown != "undefined") window.addEventListener("keydown", function(e) {
        keydown(e.keyCode);
    });
    else window.addEventListener("keydown", function(e) {});
    if (typeof keyup != "undefined") window.addEventListener("keyup", function(e) {
        keyup(e.keyCode);
    });
    else window.addEventListener("keyup", function(e) {});
}
