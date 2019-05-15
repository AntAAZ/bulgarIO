let config = {};

config.serverPort = 3000;
config.mapSize = 10000;

config.player = {
    size: 64,
    speed: 10,
    color: {
        red: [100, 255],
        green: [200, 255],
        blue: [200, 256],
	    alpha: [200, 256]
    }
};

config.food = {
    size: 16,
    amount: 10000,
    color: {
        red: [100, 156],
        green: [100, 156],
        blue: [200, 256],
	    alpha: [200, 256]
    }
};
config.powerUp = {
    size: 48,
    amount: 5000,
    color: {
        red: [50, 156],
        green: [50, 156],
        blue: [50, 256],
	    alpha: [200, 256]
    },
    names : ["speed+", "speed-", "size+", "size-", "teleport"]
};
module.exports = config;
