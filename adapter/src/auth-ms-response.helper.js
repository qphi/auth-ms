const { CookieService } = require('micro'); 

/**
 * @class AuthResponseHelper
 */
class AuthResponseHelper {
    constructor(context) {
        console.log('context', context)
        this.services = {
            cookie: CookieService
        }

        this.state = context.state.auth_ms;
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

    clearCredentials(response) {
        this.removeTokens(response);
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

module.exports = AuthResponseHelper;

