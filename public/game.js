//non oop fr now
var myX, myY, mySize = 50,
    speed = 5;
var canvas = document.getElementById("canvas-id");
canvas.width = window.innerWidth - 5;
canvas.height = window.innerHeight - 5;

var fdX = [],
    fdY = [],
    fdSize = 10,
    fdColor = [],
    bloopsCount = 0;

function initGame() {
    //set initial properties of current user
    sharedStorage.setForMe("myX", 0);
    sharedStorage.setForMe("myY", 0);
    sharedStorage.setForMe("mySize", 50);
    sharedStorage.setForMe("myColor", getRandomColor());

    //get properties for current user (no latency for this action)
    myX = sharedStorage.getForMe("myX");
    myY = sharedStorage.getForMe("myY");
    mySize = sharedStorage.getForMe("mySize");
    myColor = sharedStorage.getForMe("myColor");

    for (var i = 0; i < 10000; i++) {
        var x = -10000 + Math.random() * 20000;
        var y = -10000 + Math.random() * 20000;
        fdX[i] = x;
        fdY[i] = y;
        fdColor[i] = getRandomColor();
        bloopsCount++;
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#F';
    for (var i = 0; i < 5; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function collision(p1x, p1y, r1, p2x, p2y, r2) {

    if (p1x == p2x && p1y == p2y && r1 == r2) return false;

    var a = r1 + r2,
        x = p1x - p2x,
        y = p1y - p2y;

    if (a > Math.sqrt((x * x) + (y * y))) return true;

    return false;
}
var cameraX, cameraY, vecX, vecY, vecLen;

function update() {
    cameraX = canvas.width / 2 - myX, cameraY = canvas.height / 2 - myY;
    vecX = mouseX - cameraX - myX;
    vecY = mouseY - cameraY - myY;
    vecLen = Math.sqrt(vecX * vecX + vecY * vecY);
    vecX /= vecLen;
    vecY /= vecLen;
    myX = myX + vecX * speed;
    myY = myY + vecY * speed;
    sharedStorage.setForMe("myX", myX);
    sharedStorage.setForMe("myY", myY);

    /* collision between players
    for (var i=0; i<sharedStorage.list.length; ++i){
        if (sharedStorage.list[i]){
            if(collision(myX, myY, mySize, sharedStorage.getForUser(i, "myX"), 
				sharedStorage.getForUser(i, "myY"), 
				sharedStorage.getForUser(i, "mySize"))){
                console.log("collision detected");
            }
        }
    }  */
}

function draw() {
    cameraX = canvas.width / 2 - myX, cameraY = canvas.height / 2 - myY;
    for (var i = 0; i < bloopsCount; ++i) {
        context.beginPath();
        context.fillStyle = fdColor[i];
        context.arc(fdX[i] + cameraX, fdY[i] + cameraY, fdSize, 0, 2 * Math.PI);
        context.fill();
    }
    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            context.beginPath();
            context.fillStyle = sharedStorage.getForUser(i, "myColor");
            context.arc(sharedStorage.getForUser(i, "myX") + cameraX, sharedStorage.getForUser(i, "myY") + cameraY, sharedStorage.getForUser(i, "mySize"), 0, 2 * Math.PI);
            context.fill();
        }
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());

function keyup(key) {}

function mouseup() {}
