const { Singleton, CookieService } = require('micro'); 

/**
 * @class ResponseHelper
 */
class ResponseHelper {
    constructor() {
        this.services = {
            cookie: CookieService
        }
    }

    addIdentityToken(response, clientSettings, token, send = true) {
        this.services.cookie.set(
            response,
            clientSettings.COOKIE_JWT_ACCESS_NAME, 
            token, 
            { 
                httpOnly: true, 
                maxAge: clientSettings.JWT_ACCESS_TTL
            }
        );

        if (send === true) {
            response.sendStatus(200);
        }
    }

    addRefreshToken(response, clientSettings, token, send = true) {
        this.services.cookie.set(
            response,
            clientSettings.COOKIE_JWT_REFRESH_NAME, 
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

    removeTokens(response, clientSettings) {
        this.removeRefreshToken(response, clientSettings);
        this.removeIdentityToken(response, clientSettings);
    }

    removeRefreshToken(response, clientSettings) {
        response.clearCookie(clientSettings.COOKIE_JWT_ACCESS_NAME);
    }

    removeIdentityToken(response, clientSettings) {
        response.clearCookie(clientSettings.COOKIE_JWT_REFRESH_NAME);
    }
}

module.exports = /** @type {ResponseHelper} */ Singleton.create(ResponseHelper);

