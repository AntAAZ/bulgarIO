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

const PI = 22/7;

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
var cameraX, cameraY, vecX, vecY, vecLen, zoom = 60 / mySize;

function expand(p1size, p2size){
    var sum = PI * p1size * p1size + PI * p2size * p2size;
    p1size = Math.sqrt(sum / PI);
    
    return p1size;
}

function update() {
    cameraX = canvas.width/2 - myX * zoom;
    cameraY = canvas.height/2 - myY * zoom;
    zoom = 60 / mySize;
    
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
        if(collision(myX, myY, mySize - 2 * fdSize, fdX[i] ,fdY[i], fdSize)){
            fdX[i] = 100000;
            mySize = expand(mySize, fdSize);
            sharedStorage.setForMe("mySize" , mySize);
        }
      
    }
    
    // collision between players
    for (var i=0; i<sharedStorage.list.length; ++i){
        if (sharedStorage.list[i]){
            if(collision(myX, myY, mySize - 2* sharedStorage.getForUser(i, "mySize"), sharedStorage.getForUser(i, "myX"), 
				sharedStorage.getForUser(i, "myY"), 
				sharedStorage.getForUser(i, "mySize"))){
                
                mySize = expand(mySize, sharedStorage.getForUser(i, "mySize"));
                sharedStorage.setForMe("mySize", mySize);
                sharedStorage.setForUser(i,"mySize",0); 
            }
        }
    }     
}

function draw() {
    cameraX = canvas.width/2 - myX * zoom;
    cameraY = canvas.height/2 - myY * zoom;
    zoom = 60 / mySize;
    
    //cameraX = canvas.width / 2 - myX, cameraY = canvas.height / 2 - myY;
    for (var i = 0; i < bloopsCount; ++i) {
        context.beginPath();
        context.fillStyle = fdColor[i];
        context.arc(fdX[i] * zoom + cameraX, fdY[i] * zoom + cameraY, fdSize * zoom, 0, 2 * Math.PI);
        context.fill();
    }
    for (var i = 0; i < sharedStorage.list.length; ++i) {
        if (sharedStorage.list[i]) {
            context.beginPath();
            context.fillStyle = sharedStorage.getForUser(i, "myColor");
            context.arc(sharedStorage.getForUser(i, "myX") * zoom + cameraX, 
                        sharedStorage.getForUser(i, "myY") * zoom + cameraY,
                        sharedStorage.getForUser(i, "mySize") * zoom, 0, 2 * Math.PI);
            
            context.fill();
        }
    }
}

document.addEventListener('contextmenu', event => event.preventDefault());

function keyup(key) {}

function mouseup() {}
