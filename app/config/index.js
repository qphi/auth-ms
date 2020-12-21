const _6hours = 518400000;

module.exports = {
    api: {
        requestAdapter: require('../src/API/request.helper'),
        responseAdapter: require('../src/API/response.helper'),
        userRequestAdapter: require('../src/API/UserRequest.helper')
    },
    
    spi: {
        userNotification: require('../src/SPI/UserNotification.service')
    },

    services: {},

    domain: {
        jwt: require('../src/Domain/jwt.service'),
    },
 
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    params: {
        forgotPasswordTokenTTL: _6hours,
        DYNAMO_API_KEY_INDEX_NAME: process.env.DYNAMO_API_KEY_INDEX_NAME
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

            jwtPersistence: context => {
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