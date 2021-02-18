const _6hours = 518400000;

module.exports = {
    api: {
        identityRequestHelper: new (require('../src/API/identity-token-request.helper'))(),
        responseAdapter: require('../src/API/response.helper'),
        userRequestAdapter: require('../src/API/UserRequest.helper'),
        refreshRequestHelper: require('../src/API/refresh-token-request.helper')
    },
    
    spi: {
        userNotification: new (require('../src/SPI/UserNotification.service'))()
    },

    services: {
        RSAKeyGenerator: new (require('../src/services/rsa-key-generator.service'))()
    },

    domain: {
        jwt: require('../src/Domain/jwt.service'),
    },
 
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    params: {
        forgotPasswordTokenTTL: _6hours,
        DYNAMO_API_KEY_INDEX_NAME: process.env.DYNAMO_API_KEY_INDEX_NAME,
        DYNAMO_TOKEN_TARGET_INDEX_NAME: process.env.DYNAMO_TOKEN_TARGET_INDEX_NAME,
        DYNAMO_USER_FindByUUID_INDEX_NAME: process.env.DYNAMO_USER_FindByUUID_INDEX_NAME,
    },

    factory: {
        params: {
            HTTPSignaturePrivateKey: async context => {
                const provider = context.provider.HTTPSignaturePrivateKey;
                return await provider.provide();
            },

            HTTPSignaturePublicKey: async context => {
                const provider = context.provider.HTTPSignaturePublicKey;
                return await provider.provide();
            }
        },

        services: {
            jwt: context => {
                const type = require('../src/services/jwt.service');
                return new type(context);
            },

            refreshToken: context => {
                const type = require('../src/services/refresh-token.service');
                return new type(context);
            },


            HTTPSignatureSigner: async context => {
                const Type = require('../src/services/HTTPSignatureSigner.service');
                const instance = await Type.create({
                    // secret: 'auth-ms-dev-private',
                    key: context.params.HTTPSignaturePrivateKey,
                    keyId: 'auth-ms-dev-private',
                    //privateKeyProvider: context.provider.HTTPSignaturePrivateKey,
                    // privateKeyProvider: context.params.HTTPSignaturePrivateKey,
                    ...context
                });

               return instance;
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

    provider: {
        HTTPSignaturePrivateKey:  new (require('../src/Provider/HttpSignaturePrivateKey.provider'))(),
        HTTPSignaturePublicKey:  new (require('../src/Provider/HttpSignaturePublicKey.provider'))(),
    },

    entity: {
        user: process.env.USER_ENTITY,
        jwt: process.env.JWT_ENTITY,
        ms_recorded: process.env.MS_RECORDED_ENTITY
    }
};