var myX, myY, mySize = 20;
var x = 1920, y = 1080;
var GridSize = 50;
var canvas = document.getElementById("canvas-id");
canvas.width  = window.innerWidth-5;
canvas.height = window.innerHeight-5;

function initGame(){
    //set initial properties of current user
    sharedStorage.setForMe("myX", 0);
    sharedStorage.setForMe("myY", 0);
    
    //get properties for current user (no latency for this action)
    myX = sharedStorage.getForMe("myX");
    myY = sharedStorage.getForMe("myX");
}

function collision (p1x, p1y, r1, p2x, p2y, r2){
    var a;
    var x;
    var y;

    a = r1 + r2;
    x = p1x - p2x;
    y = p1y - p2y;

    if(a > Math.sqrt((x * x) + (y * y))){
        return true;
    } else {
        return false;
    }   
}

function update() {
	myX = myX+(mouseX-myX)/10;
	myY = myY+(mouseY-myY)/10;
    sharedStorage.setForMe("myX", myX);
    sharedStorage.setForMe("myY", myY);

    // Collison testing //
    console.log("[Collision testing] You need 2 players! You can test it in 1 of the windows");
    console.log(collision(myX , myY , mySize, sharedStorage.getForUser(1, "myX") ,sharedStorage.getForUser(1, "myY") , mySize) );
    //////////////////////

}
	
var p = 0;
function draw() {
    
    for (var i = 0; i <= x; i += GridSize) {
        context.moveTo(0.5 + i,0);
        context.lineTo(0.5 + i, y);
    }


    for (var i = 0; i <= y; i += GridSize) {
        context.moveTo(p, 0.5+i);
        context.lineTo(x, 0.5+i);
    }
    context.strokeStyle = "#acacac";
    context.stroke();

    for (var i=0; i<sharedStorage.list.length; ++i){
        if (sharedStorage.list[i]){

            context.beginPath();
            context.arc(sharedStorage.getForUser(i, "myX"), sharedStorage.getForUser(i, "myY"), mySize, 0, 2 * Math.PI);
            context.fill();
            
            
        }
    }    
}

document.addEventListener('contextmenu', event => event.preventDefault());
function keyup(key) {}
function mouseup() {}
