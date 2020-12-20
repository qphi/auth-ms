const { CookieService } = require('micro'); 

/**
 * @class AuthResponseHelper
 */
class AuthResponseHelper {
    constructor(context) {
        this.services = {
            cookie: CookieService
        }

        this.state = context.state.auth_ms;
    }

    addIdentityToken(response, token) {
        this.services.cookie.set(
            response,
            this.state.jwtAccessName, 
            token, 
            { 
                httpOnly: true, 
                maxAge: this.state.jwtAccessTTL + 60000
            }
        );
    }

    addRefreshToken(response, token) {
        this.services.cookie.set(
            response,
            this.state.jwtRefreshName, 
            token, 
            { 
                httpOnly: true, 
                maxAge: 86400000 // 1 day
            }
        );
    }

    clearCredentials(response) {
        this.removeTokens(response);
    }
    
    removeTokens(response) {
        this.removeRefreshToken(response);
        this.removeIdentityToken(response);
    }

    removeRefreshToken(response) {
        response.clearCookie(this.state.jwtAccessName);
    }

    removeIdentityToken(response) {
        response.clearCookie(this.state.jwtRefreshName);
    }
}

module.exports = AuthResponseHelper;

