const configuration = require('../index');

configuration.factory.spi.customerApplicationPersistence = context => {
    const type = require('../../src/SPI/CustomerApplication/MockCustomerApplicationPersistence.service');
    return new type(context);
};

configuration.factory.spi.userPersistence = context => {
    const type = require('../../src/SPI/User/MockUserPersistence.service');
    return new type(context);
};

module.exports = configuration;