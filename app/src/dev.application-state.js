const _6hoursInSeconds = 518400;

const domain = {
    jwt: require('../src/Domain/jwt.service'),
}
module.exports = {
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    params: {
        forgotPasswordTokenTTL: _6hoursInSeconds,
        refreshTokenTTL: _6hoursInSeconds,
        DYNAMO_API_KEY_INDEX_NAME: process.env.DYNAMO_API_KEY_INDEX_NAME,
        DYNAMO_TOKEN_TARGET_INDEX_NAME: process.env.DYNAMO_TOKEN_TARGET_INDEX_NAME,
        DYNAMO_USER_FindByUUID_INDEX_NAME: process.env.DYNAMO_USER_FindByUUID_INDEX_NAME,
    },

    domain
};