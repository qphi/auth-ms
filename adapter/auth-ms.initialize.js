const JWTVerifierService = require("../app/src/Domain/jwt-verifier.service");
const AuthRequestHelper = require("./src/auth-ms-request.helper")

module.exports = context => {
    if (typeof context.api.authRequestHelper === 'undefined') {
        context.api.authRequestHelper = new AuthRequestHelper(context);
    }

    if (typeof context.services.JWTVerifierService === 'undefined') {
        context.services.JWTVerifierService = new JWTVerifierService();
    }

    if (typeof context.param.authJwtSecretIdentityToken === 'undefined') {
        context.services.authJwtSecretIdentityToken = process.env.AUTH_JWT_SECRET_IDENTITY_TOKEN;
    }
}