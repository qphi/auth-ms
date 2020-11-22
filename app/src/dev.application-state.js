const _6hours = 518400000;

const domain = {
    jwt: require('../src/Domain/jwt.service'),
}
module.exports = {
    schema: {
        userSchema: require('../src/Domain/User/user.schema'),
        customerApplicationSchema: require('../src/Domain/CustomerApplication/customerApplication.schema'),
    },

    param: {
        forgotPasswordTokenTTL: _6hours
    },

    domain
};