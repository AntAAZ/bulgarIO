socket.on('spawn', function (data) {
    let bloop = new Bloop(data.x, data.y, data.radius, data.color, data.speed, data.username, data.id);
    bloops.set(data.id, bloop);

    let lbData = {
        username: bloop.username,
        score: bloop.radius
    }
    leaderboard.set(data.id, lbData);
});

socket.on('init', function (data) {
    data.foods.forEach(function (food) {
        foods.push(new Food(food.x, food.y, food.radius, food.color));
    });
    data.powerUps.forEach(function (powerUp) {
        powerUps.push(new PowerUp(powerUp.x, powerUp.y, powerUp.radius, powerUp.color, powerUp.name));
    });
    mapSize = data.mapSize;
    playerSize = data.playerSize;
    playerSpeed = data.playerSpeed;
});

socket.on('update', function (data) {
    let bloop = new Bloop(data.x, data.y, data.radius, data.color, data.speed, data.username, data.id);
    bloop.pos = createVector(data.posx, data.posy);
    bloops.set(data.id, bloop);
});
socket.on('sendStep', function (data) {
    let step = new Step(data.x, data.y, data.radius, color(data.color[0], data.color[1], data.color[2]));
    step.color.setAlpha(data.color[3]);
    steps.push(step);
});
socket.on('addFood', function (data) {
    let foodObject = data.initializer;
    foods.push(new Food(foodObject.x, foodObject.y, foodObject.radius, foodObject.color));
});
socket.on('eatFood', function (data) {
    foods.splice(data.index, 1);
});
socket.on('addPowerUp', function (data) {
    let powerUpObject = data.initializer;
    let powerUp = new PowerUp(powerUpObject.x, powerUpObject.y, powerUpObject.radius, powerUpObject.color, powerUpObject.name);
    powerUps.push(powerUp);
});
socket.on('eatPowerUp', function (data) {
    powerUps.splice(data.index, 1);
});


socket.on('delete', function (data) {
    bloops.delete(data.id);
    leaderboard.delete(data.id);
});

socket.on('leaderboard', function (data) {
    leaderboard.set(data.id, {
        username: data.username, 
        score: data.score
    });
});
