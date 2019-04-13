let config = {};

config.serverPort = 3000;
config.mapSize = 5000;

config.player = {
    size: 56,
    speed: 10,
    color: {
        red: [100, 156],
        green: [100, 156],
        blue: [200, 256]
    }
};

config.food = {
    size: 14,
    amount: 2500,
    color: {
        red: [100, 156],
        green: [100, 156],
        blue: [200, 256]
    }

};

module.exports = config;