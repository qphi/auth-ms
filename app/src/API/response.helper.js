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

    addIdentityToken(response, applicationSettings, token, send = true) {
        response.set(applicationSettings.COOKIE_JWT_ACCESS_NAME, token);
        // todo use response header
        
        // this.services.cookie.set(
        //     response,
        //     applicationSettings.COOKIE_JWT_ACCESS_NAME,
        //     token, 
        //     { 
        //         httpOnly: true, 
        //         maxAge: applicationSettings.JWT_ACCESS_TTL
        //     }
        // );

        // if (send === true) {
        //     response.sendStatus(200);
        // }
    }

    addRefreshToken(response, applicationSettings, token, send = true) {
        response.set(applicationSettings.COOKIE_JWT_REFRESH_NAME, token);
        // this.services.cookie.set(
        //     response,
        //     applicationSettings.COOKIE_JWT_REFRESH_NAME,
        //     token, 
        //     { 
        //         httpOnly: true, 
        //         maxAge: 86400000 // 1 day
        //     }
        // );

        // if (send === true) {
        //     response.sendStatus(200);
        // }
    }

    removeTokens(response, applicationSettings) {
        this.removeRefreshToken(response, applicationSettings);
        this.removeIdentityToken(response, applicationSettings);
    }
    // removeRefreshToken(response, applicationSettings) {
    //     response.clearCookie(applicationSettings.COOKIE_JWT_ACCESS_NAME);
    // }

    // removeIdentityToken(response, applicationSettings) {
    //     response.clearCookie(applicationSettings.COOKIE_JWT_REFRESH_NAME);
    // }
}

module.exports = /** @type {ResponseHelper} */ Singleton.create(ResponseHelper);

