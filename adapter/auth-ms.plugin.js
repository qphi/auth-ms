const JwtVerifierService = require("../app/src/Domain/jwt-verifier.service");
const AuthRequestHelper = require("./src/request.helper")
const AuthResponseHelper = require("./src/response.helper")
const AuthState = require("./src/auth-ms-adapter.state");
const UserRequestHelper = require("../app/src/API/UserRequest.helper");
const AuthSPIService = require("./src/auth.service");
const AuthenticatorMicroServiceController = require('./src/controller');

module.exports = context => {
    if (typeof context.state.auth_ms === 'undefined') {
        context.state.auth_ms = new AuthState(context);
    }
 
    if (typeof context.api.authRequestHelper === 'undefined') {
        context.api.authRequestHelper = new AuthRequestHelper(context);
    }

    if (typeof context.api.authResponseHelper === 'undefined') {
        context.api.authResponseHelper = new AuthResponseHelper(context);
    }
    
    if (typeof context.api.userRequestAdapter === 'undefined') {
        context.api.userRequestAdapter = new UserRequestHelper(context);
    }

    if (typeof context.services.jwtVerifierService === 'undefined') {
        context.services.jwtVerifierService = new JwtVerifierService(context);
    }

    if (typeof context.services.authService === 'undefined') {
        context.services.authService = new AuthSPIService(context);
    }

    if (typeof context.params.authJwtSecretIdentityToken === 'undefined') {
        context.services.authJwtSecretIdentityToken = process.env.AUTH_JWT_SECRET_IDENTITY_TOKEN;
    }

    if (typeof context.controllers.authenticatorController === 'undefined') {
        context.controllers.authenticatorController = new AuthenticatorMicroServiceController(context);
    }

    context.services.authService.initialize();
};