var myX, myY;
var x = 1600, y = 1600;
var GridSize = 30;

function initGame(){
    //set initial properties of current user
    sharedStorage.setForMe("myX", 0);
    sharedStorage.setForMe("myY", 0);
    
    //get properties for current user (no latency for this action)
    myX = sharedStorage.getForMe("myX");
    myY = sharedStorage.getForMe("myX");
}

function update() {
	myX = myX+(mouseX-myX)/10;
	myY = myY+(mouseY-myY)/10;
    sharedStorage.setForMe("myX", myX);
    sharedStorage.setForMe("myY", myY);
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
            context.arc(sharedStorage.getForUser(i, "myX"), sharedStorage.getForUser(i, "myY"), 20, 0, 2 * Math.PI);
            context.fill();
            
            
        }
    }

    
    
}

function keyup(key) {}
function mouseup() {}
