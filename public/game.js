//non oop fr now
var myX, myY, mySize = 50,
    minSize = mySize,
    mapSize = 10000,
	speed = 3;

var canvas = document.getElementById("canvas-id");
document.body.style.background = "rgba(9, 10, 10, 0.9)";
canvas.width = window.innerWidth - 5;
canvas.height = window.innerHeight - 5;

var fdX = [],
    fdY = [],
    fdSize = 10,
    fdColor = [],
    bloopsCount = 0;

function initGame() {
    //set initial properties of current user
    sharedStorage.setForMe("myX", -mapSize + Math.random() * mapSize * 2);
    sharedStorage.setForMe("myY", -mapSize + Math.random() * mapSize * 2);
    sharedStorage.setForMe("mySize", minSize);
    sharedStorage.setForMe("myColor", getRandomColor());

    //get properties for current user (no latency for this action)
    myX = sharedStorage.getForMe("myX");
    myY = sharedStorage.getForMe("myY");
    mySize = sharedStorage.getForMe("mySize");
    myColor = sharedStorage.getForMe("myColor");

    for (var i = 0; i < mapSize; i++) {
        var x = -mapSize + Math.random() * mapSize * 2;
        var y = -mapSize + Math.random() * mapSize * 2;
        fdX[i] = x;
        fdY[i] = y;
        fdColor[i] = getRandomColor();
        bloopsCount++;
    }
}

function getRandomColor() {
    var red = Math.floor(Math.random() * 256);
    var green = 100 + Math.floor(Math.random() * 156);
    var blue = 200 + Math.floor(Math.random() * 56);
    var alpha = 0.8 + Math.floor(Math.random()) * 0.2;

    return `rgba(${red},${green},${blue},${alpha}`;
}

function collision(p1x, p1y, r1, p2x, p2y, r2) {

    if (p1x == p2x && p1y == p2y && r1 == r2) return false;

    var a = r1 + r2,
        x = p1x - p2x,
        y = p1y - p2y;

    if (a > Math.sqrt((x * x) + (y * y))) return true;

    return false;
}

function expand(p1size, p2size) {
    return Math.sqrt(p1size * p1size + p2size * p2size);
}

var cameraX, cameraY, vecX, vecY, vecLen, zoom;

function update() {
    zoom = minSize / mySize;
    cameraX = canvas.width / 2 - myX * zoom;
    cameraY = canvas.height / 2 - myY * zoom;

    vecX = mouseX - cameraX - myX * zoom;
    vecY = mouseY - cameraY - myY * zoom;
    vecLen = Math.sqrt(vecX * vecX + vecY * vecY);
    vecX /= vecLen;
    vecY /= vecLen;
    myX = myX + vecX * speed;
    myY = myY + vecY * speed;

    sharedStorage.setForMe("myX", myX);
    sharedStorage.setForMe("myY", myY);

    // Eating bloops
    for (var i = 0; i < bloopsCount; ++i) {
        if (collision(myX, myY, mySize - 2 * fdSize, fdX[i], fdY[i], fdSize)) {
            fdX.splice(i, 1);
            fdY.splice(i, 1);
            fdColor.splice(i, 1);
            bloopsCount--;
            mySize = expand(mySize, fdSize);
            sharedStorage.setForMe("mySize", mySize);
        }

    }

    // collision between players
    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            if (collision(myX, myY, mySize - 2 * sharedStorage.getForUser(i, "mySize"), sharedStorage.getForUser(i, "myX"),
                    sharedStorage.getForUser(i, "myY"),
                    sharedStorage.getForUser(i, "mySize"))) {

                mySize = expand(mySize, sharedStorage.getForUser(i, "mySize"));
                sharedStorage.setForMe("mySize", mySize);
                sharedStorage.setForUser(i, "mySize", 0);
            }
        }
    }
}

function draw() {

    context.fillStyle = "white";
    context.font = "25px Italic Verdana";
    context.fillText(`{x => ${myX.toFixed(1)} | y => ${myY.toFixed(1)}]`, 50, 50);

    zoom = 50 / mySize;
    cameraX = canvas.width / 2 - myX * zoom;
    cameraY = canvas.height / 2 - myY * zoom;

    //cameraX = canvas.width / 2 - myX, cameraY = canvas.height / 2 - myY;
    for (var i = 0; i < bloopsCount; ++i) {
        var x = fdX[i] * zoom + cameraX,
            y = fdY[i] * zoom + cameraY;
        if (x > -fdSize && x < canvas.width + fdSize && y > -fdSize && y < canvas.height + fdSize) {
            context.beginPath();
            context.fillStyle = fdColor[i];
            context.arc(x, y, fdSize * zoom, 0, 2 * Math.PI);
            context.fill();
        }
    }
    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            var x = sharedStorage.getForUser(i, "myX") * zoom + cameraX;
            var y = sharedStorage.getForUser(i, "myY") * zoom + cameraY;
            var size = sharedStorage.getForUser(i, "mySize") * zoom;
            if (sharedStorage.id == i || (x > -size && x < canvas.width + size && y > -size && y < canvas.height + size)) {
                context.beginPath();
                context.fillStyle = sharedStorage.getForUser(i, "myColor");
                context.arc(x, y, size, 0, 2 * Math.PI);
                context.fill();
            }
        }
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());

function keyup(key) {}

function mouseup() {}
