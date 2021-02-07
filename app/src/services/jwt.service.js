
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');
const { params } = require('../dev.application-state');
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
      
        // if (await this.spi.jwtPersistence.hasRefreshToken(refreshToken)) {
        //     throw new InvalidTokenException();
        // }

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

    getApplicationSettings(request) {
        return request.applicationSettings;
    }

    async clear(request, response) {
        await this.deleteRefreshToken(request);

        const applicationSettings = this.getApplicationSettings(request);
        this.api.responseAdapter.removeTokens(response, applicationSettings);
    }

    /**
     * @param {Object} payload
     * @param {Object} applicationSettings
     */
    forgeIdentityToken(payload, applicationSettings) {
        const nowInSeconds = Math.ceil(Date.now() / 1000);
        const safeExpiration = nowInSeconds + applicationSettings.JWT_ACCESS_TTL;
        payload.expire = safeExpiration;

        return this.domain.jwt.sign(
            payload, 
            applicationSettings.JWT_SECRET_ACCESSTOKEN,
            600 + applicationSettings.JWT_ACCESS_TTL // allow refresh token expired from less than 10 min
        );
    }

    /**
     * @param {Object} payload
     * @param {Object} applicationSettings
     * @param {string} applicationSettings.JWT_SECRET_REFRESHTOKEN
     */
    forgeRefreshToken(payload, applicationSettings) {
        const forgotPasswordTTL = params.refreshTokenTTL;
        const safeExpiration = Math.ceil((Date.now() / 1000)) + forgotPasswordTTL;
        payload.expire = safeExpiration;
        return this.domain.jwt.sign(
            payload, 
            applicationSettings.JWT_SECRET_REFRESHTOKEN,
            forgotPasswordTTL
        );
    }
 
      /**
     * @param {Mixed} payload 
     * @param {Object} applicationSettings
     * @param {string} applicationSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
     */
    forgeForgotPasswordToken(payload, applicationSettings = {JWT_SECRET_FORGOTPASSWORDTOKEN : ''}) {
        return this.domain.jwt.sign(
            payload, 
            applicationSettings.JWT_SECRET_FORGOTPASSWORDTOKEN
        );
    }

    /**
     * @param {Object} payload
     * @param {Object} applicationSettings
     */
    forgeToken(payload, applicationSettings) {
        payload.salt = crypto.randomBytes(10).toString('hex');
        
        return {
            identityToken: this.forgeIdentityToken(payload, applicationSettings),
            refreshToken: this.forgeRefreshToken(payload, applicationSettings)
        };
    }

    verifyForgotPasswordToken(forgotPasswordToken, applicationSettings) {
       return this.verify(
            forgotPasswordToken,
            applicationSettings.JWT_PUBLIC_FORGOTPASSWORDTOKEN
        );  
    }

    verify(token, secret, options = {}) {
        return this.domain.jwt.verify(
            token, 
            secret,
            options
        );   
    }
}

module.exports = JWTService;