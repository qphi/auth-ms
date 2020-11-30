const _6hours = 518400000;

module.exports = {
    api: {
        requestAdapter: require('../src/API/request.helper'),
        responseAdapter: require('../src/API/response.helper'),
        userRequestAdapter: require('../src/API/UserRequest.helper')
    },
    
    spi: {
       
    },

    services: {},

    domain: {
        jwt: require('../src/Domain/jwt.service'),
    },
 
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    param: {
        forgotPasswordTokenTTL: _6hours
    },

    factory: {
        services: {
            jwt: context => {
                const type = require('../src/services/jwt.service')
                return new type(context);
            }
        },

        spi: {
            userPersistence: context => {
                const type = require('../src/SPI/User/DynamoUserPersistence.service');
                return new type(context);
            },

            jwtPeristence: context => {
                const type = require('../src/SPI/JWT/DynamoJWTPersistence.service');
                return new type(context);
            },

            customerApplicationPersistence: context => {
                const type = require('../src/SPI/CustomerApplication/DynamoCustomerApplicationPersistence.service');
                return new type(context);
            }
        }
    },

    entity: {
        user: process.env.USER_ENTITY,
        jwt: process.env.JWT_ENTITY,
        ms_recorded: process.env.MS_RECORDED_ENTITY
    }
};