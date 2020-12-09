const { CookieService } = require('micro'); 
const MissingRefreshToken = require('../../app/src/Exceptions/MissingRefreshToken.exception');
const MissingIdentityToken = require('../../app/src/Exceptions/MissingIdentityToken.exception');
/**
 * @class AuthRequestHelper
 */
class AuthRequestHelper {
    constructor(context) {
        let cookieService = CookieService;
        if (
            typeof context.services !== 'undefined' &&
            typeof context.services.cookie !== 'undefined'
        ) {
            cookieService = context.services.cookie;
        }

        this.services = {
            cookie: cookieService
        }

        this.state = context.state.auth_ms;
    }

    getIdentityToken(request) {
        const identityToken = this.services.cookie.get(request, this.data.cookieJwtAccessName);

        if (identityToken === null) {
            throw new MissingIdentityToken(`missing token from ${this.data.cookieJwtAccessName}`);
        }

        else {
            return refreshToken;
        }
    }

    getRefreshToken(request) {
        const refreshToken = this.services.cookie.get(request, this.data.cookieJwtRefreshName);

        if (refreshToken === null) {
            throw new MissingRefreshToken(`missing token from ${this.data.cookieJwtRefreshName}`);
        }

        else {
            return refreshToken;
        }
    }

    getRefreshTokenSecret(request) {
        return this.data.jwtResfreshSecret;
    }

}

module.exports = AuthRequestHelper;

