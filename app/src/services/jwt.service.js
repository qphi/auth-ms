
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');
const { param } = require('../dev.application-state');
const MissingRefreshTokenException = require('../Exceptions/MissingRefreshToken.exception');
const crypto = require('crypto');

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
            jwtPersistence: settings.spi.jwtPersistence
        }

        this.domain = {
            jwt: settings.domain.jwt
        };
    }

    async getRefreshToken(request) {
        const refreshToken = this.api.requestAdapter.getRefreshToken(request);
        
        if (await this.spi.jwtPersistence.hasRefreshToken(refreshToken)) {
            throw new InvalidTokenException();
        }

        return refreshToken;
    }

    async deleteRefreshToken(request) {
        try {
            const refreshToken = this.api.requestAdapter.getRefreshToken(request);
            await this.spi.jwtPersistence.deleteToken(refreshToken);    
        }

        catch(error) {
            if (error instanceof MissingRefreshTokenException) {
                // it's ok
            }

            else {
                console.error(error);
            }
           
        }
    }

    getClientSettings(request) {
        return request.service;
    }

    async clear(request, response) {
        await this.deleteRefreshToken(request);

        const clientSettings = this.getClientSettings(request);
        this.api.responseAdapter.removeTokens(response, clientSettings);
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeIdentityToken(payload, clientSettings) {
        const safeExpiration = Date.now() +  clientSettings.JWT_ACCESS_TTL;
        payload.expire = safeExpiration;
        return this.domain.jwt.sign(
            payload, 
            clientSettings.JWT_SECRET_ACCESSTOKEN,
            600000 + clientSettings.JWT_ACCESS_TTL
        );
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeRefreshToken(payload, clientSettings) {
        const forgotPasswordTTL = param.forgotPasswordTokenTTL;
        return this.domain.jwt.sign(
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
        return this.domain.jwt.sign(
            payload, 
            clientSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
        );
    }

    /**
     * @param {Mixed} payload 
     * @param {Mixed} clientSettings 
     */
    forgeToken(payload, clientSettings) {     
        payload.salt = crypto.randomBytes(10);
        
        return {
            identityToken: this.forgeIdentityToken(payload, clientSettings),
            refreshToken: this.forgeRefreshToken(payload, clientSettings)
        };
    }

    verifyForgotPasswordToken(forgotPasswordToken, clientSettings) {
       return this.verify(
            forgotPasswordToken,
            clientSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
        );  
    }

    verify(token, secret, options = {}) {
        return this.domain.jwt.sign(
            token, 
            secret,
            options
        );   
    }
}

module.exports = JWTService;