const { Singleton, CookieService } = require('micro'); 
const MissingRefreshToken = require('../Exceptions/MissingRefreshToken.exception');


const { Singleton, CookieService } = require('micro'); 

/**
 * @class AuthRequestHelper
 */
class AuthResponseHelper {
    constructor(context) {
        this.services = {
            cookie: CookieService
        }

        this.data = {
            api_key: context.param.AUTH_MS_API_KEY,
            jwtRefreshName: context.param.COOKIE_JWT_REFRESH_NAME,
            jwtAccessName: context.param.COOKIE_JWT_ACCESS_NAME,
            jwtRefreshName: context.param.COOKIE_JWT_REFRESH_NAME,
            jwtAccessTTL: context.param.JWT_ACCESS_TTL,
            jwtResfreshSecret: context.param.JWT_SECRET_REFRESHTOKEN,
        }
    }

    addIdentityToken(response, token, send = true) {
        this.services.cookie.set(
            response,
            this.data.jwtAccessName, 
            token, 
            { 
                httpOnly: true, 
                maxAge: this.data.jwtAccessTTL
            }
        );

        if (send === true) {
            response.sendStatus(200);
        }
    }

    addRefreshToken(response, token, send = true) {
        this.services.cookie.set(
            response,
            this.data.jwtRefreshName, 
            token, 
            { 
                httpOnly: true, 
                maxAge: 86400000 // 1 day
            }
        );

        if (send === true) {
            response.sendStatus(200);
        }
    }

    removeTokens(response) {
        this.removeRefreshToken(response);
        this.removeIdentityToken(response);
    }

    removeRefreshToken(response) {
        response.clearCookie(this.data.jwtAccessName);
    }

    removeIdentityToken(response) {
        response.clearCookie(this.data.jwtRefreshName);
    }
}

module.exports = /** @type {AuthResponseHelper} */ Singleton.create(AuthResponseHelper);

