const api = {
    requestAdapter: require('./API/request.helper')
};

const spi = {
    jwtPeristence: require('./SPI/RedisJWTPersistance.service')
};

const JWTService = require('./services/jwt.service');

module.exports = {
    services: {
        jwt: new JWTService({ api, spi})
    }
}