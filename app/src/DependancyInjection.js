const api = {
    requestAdapter: require('./API/request.helper'),
    responseAdapter: require('./API/response.helper'),
    userRequestAdapter: require('./API/UserRequest.helper')
};

const spi = {
    jwtPeristence: require('./SPI/JWT/RedisJWTPersistence.service'),
    userPersistence: require('./SPI/User/DynamoUserPersistence.service'),
    customerApplicationPersistence: require('./SPI/CustomerApplication/DynamoCustomerApplicationPersistence.service') 
};

const JWTService = require('./services/jwt.service');

const _6hours = 518400000;
const domain = require('./dev.application-state');

console.log('hello');
module.exports = {
    services: {
        jwt: new JWTService({ api, spi, domain })
    }
};