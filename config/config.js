let config = {};

config.serverPort = 3000;
config.mapSize = 5000;

config.player = {
    size: 64,
    speed: 10,
    color: {
        red: [100, 156],
        green: [100, 156],
        blue: [200, 256],
	    alpha: [100, 256]
    }
};

config.food = {
    size: 16,
    amount: 10000,
    color: {
        red: [100, 156],
        green: [100, 156],
        blue: [200, 256],
	    alpha: [100, 256]
    }

};

module.exports = config;
