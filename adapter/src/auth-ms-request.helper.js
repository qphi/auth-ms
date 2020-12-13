const { CookieService } = require('micro'); 
const MissingRefreshToken = require('../../app/src/Exceptions/MissingRefreshToken.exception');
const MissingIdentityToken = require('../../app/src/Exceptions/MissingIdentityToken.exception');
/**
 * @class
 */
class AuthRequestHelper {
    constructor(context) {
        
        console.log(context);
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

    getEmail(request) {
        return request.body.email;
    }

    getPassword(request) {
        return request.body.password;
    }

    getConfirmPassword(request) {
        return request.body.confirmPassword;
    }

    getIdentityToken(request) {
        const identityToken = this.services.cookie.get(request, this.state.jwtAccessName);

        if (identityToken === null) {
            throw new MissingIdentityToken(`missing token from ${this.state.jwtAccessName}`);
        }

        else {
            return identityToken;
        }
    }

    getRefreshToken(request) {
        const refreshToken = this.services.cookie.get(request, this.state.jwtRefreshName);

        if (refreshToken === null) {
            throw new MissingRefreshToken(`missing token from ${this.state.jwtRefreshName}`);
        }

        else {
            return refreshToken;
        }
    }

    getRefreshTokenSecret(request) {
        return this.state.jwtResfreshSecret;
    }

}

module.exports = AuthRequestHelper;

