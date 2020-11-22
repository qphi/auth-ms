
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');
const { param } = require('../dev.application-state');

class JWTService {
    constructor(settings = {}) {
        this.api = {
            /** @type {RequestHelper} */
            requestAdapter: settings.api.requestAdapter,
            /** @type {ResponseHelper} */
            responseAdapter: settings.api.responseAdapter,
        };

        this.spi = {
            /** @type {JWTPersistenceInterface} */
            jwtPeristence: settings.spi.jwtPeristence
        }

        console.log(settings)
        this.domain = {
            jwt: settings.domain.jwt
        };
    }

    async getRefreshToken(request) {
        const refreshToken = this.api.requestAdapter.getRefreshToken(request);
        
        if (await this.spi.jwtPeristence.hasRefreshToken(refreshToken)) {
            throw new InvalidTokenException();
        }

        return refreshToken;
    }

    async deleteRefreshToken(request) {
        const refreshToken = this.api.requestAdapter.getRefreshToken(request);
      
        if (refreshToken !== null) {
            await this.spi.jwtPeristence.deleteToken(access);    
        }
    }

    getClientSettings(request) {
        return request.service;
    }

    async clear(request, response) {
        await this.deleteRefreshToken(request);

        const clientSettings = this.getClientSettings(request);
        this.api.responseHelper.removeTokens(response, clientSettings);
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeIdentityToken(payload, clientSettings) {
        this.domain.jwt.sign(
            payload, 
            clientSettings.JWT_SECRET_ACCESSTOKEN,
            clientSettings.JWT_ACCESS_TTL
        );
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeRefreshToken(payload, clientSettings) {
        const forgotPasswordTTL = param.forgotPasswordTokenTTL;
        this.domain.jwt.sign(
            payload, 
            clientSettings.JWT_SECRET_REFRESHTOKEN,
            forgotPasswordTTL
        );
    }
 
      /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeForgotPasswordToken(payload, clientSettings) {
        this.domain.jwt.sign(
            payload, 
            clientSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
        );
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeToken(payload, clientSettings) {
        return {
            identityToken: this.forgeIdentityToken(payload, clientSettings),
            refreshToken: this.forgeIdentityToken(payload, clientSettings)
        };
    }

    verifyForgotPasswordToken(forgotPasswordToken, clientSettings) {
       return this.verify(
            forgotPasswordToken,
            clientSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
        );  
    }

    verify(token, secret) {
        return this.domain.jwt.sign(
            token, 
            secret
        );   
    }
}

module.exports = JWTService;