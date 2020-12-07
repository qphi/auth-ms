const api = {
    requestAdapter: require('./API/request.helper'),
    responseAdapter: require('./API/response.helper'),
    userRequestAdapter: require('./API/UserRequest.helper')
};

const spi = {
    jwtPersistence: require('./SPI/JWT/DynamoJWTPersistence.service'),
    userPersistence: require('./SPI/User/DynamoUserPersistence.service'),
    customerApplicationPersistence: require('./SPI/CustomerApplication/DynamoCustomerApplicationPersistence.service') 
};

const JWTService = require('./services/jwt.service');

const domain = require('./dev.application-state');

module.exports = {
    services: {
        jwt: new JWTService({ api, spi, domain })
    },

    domain,
    api, 
    spi
};