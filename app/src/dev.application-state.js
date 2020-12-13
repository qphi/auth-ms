const _6hours = 518400000;

const domain = {
    jwt: require('../src/Domain/jwt.service'),
}
module.exports = {
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    params: {
        forgotPasswordTokenTTL: _6hours,
        refreshPasswordTokenTTL: _6hours,
        DYNAMO_API_KEY_INDEX_NAME: process.env.DYNAMO_API_KEY_INDEX_NAME
    },

    domain
};