socket.on('spawn', function (data) {
    let bloop = new Bloop(data.x, data.y, data.radius, data.color, data.username, data.id);
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
    mapSize = data.mapSize;
    playerSize = data.playerSize;
});

socket.on('update', function (data) {
    let bloop = new Bloop(data.x, data.y, data.radius, data.color, data.username, data.id);
    bloop.pos = createVector(data.posx, data.posy);
    bloops.set(data.id, bloop);
});

socket.on('addFood', function (data) {
    let foodObject = data.initializer;
    foods.push(new Food(foodObject.x, foodObject.y, foodObject.radius, foodObject.color));
});
socket.on('eatFood', function (data) {
    foods.splice(data.index, 1);
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
