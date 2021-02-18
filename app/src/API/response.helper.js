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

    addIdentityToken(response, applicationSettings, token) {
        response.set(applicationSettings.COOKIE_JWT_ACCESS_NAME, token);
    }

    addRefreshToken(response, applicationSettings, token) {
        response.set(applicationSettings.COOKIE_JWT_REFRESH_NAME, token);
    }

    removeTokens(response, applicationSettings) {
        this.removeRefreshToken(response, applicationSettings);
        this.removeIdentityToken(response, applicationSettings);
    }

    removeRefreshToken(response, applicationSettings) {
        // response.clearCookie(applicationSettings.COOKIE_JWT_ACCESS_NAME);
    }

    removeIdentityToken(response, applicationSettings) {
        // response.clearCookie(applicationSettings.COOKIE_JWT_REFRESH_NAME);
    }
}

module.exports = /** @type {ResponseHelper} */ Singleton.create(ResponseHelper);

