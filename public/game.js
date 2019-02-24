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
var score_arr = {};

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

function respawn() {
    sharedStorage.setForMe("myX", -mapSize + Math.random() * mapSize * 2);
    sharedStorage.setForMe("myY", -mapSize + Math.random() * mapSize * 2);
    sharedStorage.setForMe("mySize", minSize);

    //get properties for current user (no latency for this action)
    myX = sharedStorage.getForMe("myX");
    myY = sharedStorage.getForMe("myY");
    mySize = sharedStorage.getForMe("mySize");
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

function expand(r1, r2) {
    return Math.sqrt(r1 * r1 + r2 * r2);
}

var cameraX, cameraY, vecX, vecY, vecLen, zoom;

function update() {
    var zoom = minSize / mySize;
    var radians = Math.atan2(mouseY - canvas.height / 2, mouseX - canvas.width / 2);
    myX = myX + Math.cos(radians) * speed;
    myY = myY + Math.sin(radians) * speed;

    if (!(mySize = sharedStorage.getForMe("mySize", mySize))) {
        respawn();
    }

    sharedStorage.setForMe("myX", myX);
    sharedStorage.setForMe("myY", myY);

    for (var i = 0; i < bloopsCount; ++i) {
        if (collision(myX, myY, mySize - fdSize, fdX[i], fdY[i], fdSize)) {
            fdX.splice(i, 1);
            fdY.splice(i, 1);
            fdColor.splice(i, 1);
            bloopsCount--;
            mySize = expand(mySize, fdSize);
            sharedStorage.setForMe("mySize", mySize);
        }

    }

    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            if (sharedStorage.id != i && collision(myX, myY, mySize - sharedStorage.getForUser(i, "mySize"), sharedStorage.getForUser(i, "myX"),
                    sharedStorage.getForUser(i, "myY"),
                    sharedStorage.getForUser(i, "mySize"))) {
                mySize = expand(mySize, sharedStorage.getForUser(i, "mySize"));
                sharedStorage.setForMe("mySize", mySize);
                sharedStorage.setForUser(i, "mySize", 0);
            }
        }
    }

    if (myX > mapSize) myX = mapSize;
    if (myY > mapSize) myY = mapSize;
    if (myX < -mapSize) myX = -mapSize;
    if (myY < -mapSize) myY = -mapSize;

}

function draw() {
    var zoom = minSize / mySize;

    context.fillStyle = "white";
    context.font = "20px Italic Verdana";
    context.fillText(`{x => ${myX.toFixed(1)} | y => ${myY.toFixed(1)}}`, 30, 30);

    context.save();
    context.resetTransform();
    context.translate(canvas.width / 2, canvas.height / 2);

    context.scale(Math.sqrt(zoom), Math.sqrt(zoom));
    context.translate(-myX, -myY);

    //cameraX = canvas.width / 2 - myX, cameraY = canvas.height / 2 - myY;
    for (var i = 0; i < bloopsCount; ++i) {
        ;
        if (fdX[i] * zoom + fdSize > myX * zoom - canvas.width / 2 && fdX[i] * zoom - fdSize < myX * zoom + canvas.width / 2 + mySize &&
            fdY[i] * zoom + fdSize > myY * zoom - canvas.height / 2 && fdY[i] * zoom - fdSize < myY * zoom + canvas.height / 2 + mySize) {
            context.beginPath();
            context.fillStyle = fdColor[i];
            context.arc(fdX[i], fdY[i], fdSize, 0, 2 * Math.PI);
            context.fill();
        }
    }
    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            var x = sharedStorage.getForUser(i, "myX");
            var y = sharedStorage.getForUser(i, "myY");
            var size = sharedStorage.getForUser(i, "mySize");
            context.beginPath();
            context.fillStyle = sharedStorage.getForUser(i, "myColor");
            context.arc(x, y, size, 0, 2 * Math.PI);
            context.fill();
        }
    }
    context.restore();

    var step = 50;
    for (var i = 0; i < sharedStorage.list.length; i++) {
        var score_arr = {};
        if (sharedStorage.list[i]) {
            score_arr[`Player ${i}`] = Math.round(sharedStorage.getForUser(i, 'mySize'));
            keysSorted = Object.keys(score_arr).sort(function(a, b) {
                return score_arr[a] - score_arr[b];
            })
            keysSorted = keysSorted.reverse();
            context.fillStyle = "white";
            context.font = "20px Italic Verdana";
            context.fillText(`${keysSorted[i]} -> ${score_arr[keysSorted[i]]}`, canvas.width - 200, step);
            step += 25;
        }
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());

function keyup(key) {}

function mouseup() {}
