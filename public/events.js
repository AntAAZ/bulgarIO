socket.on('spawn', function (data) {
    let bloop = new Bloop(data.x, data.y, data.radius, data.color, data.username, data.id);
    bloops.set(data.id, bloop);

    leaderboard.set(data.id, {
        username: bloop.username,
        score: bloop.radius
    });
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

socket.on('updateFood', function (data) {
    let foodObject = data.initializer;
    foods[data.index] = new Food(foodObject.x, foodObject.y, foodObject.radius, foodObject.color);
});

socket.on('delete', function (data) {
    bloops.delete(data.id);
    leaderboard.delete(data.id);
});

socket.on('leaderboard', function (data) {
    leaderboard.set(data.id, {username: data.username, score: data.score});
});