const { Singleton, CookieService } = require('micro'); 
const MissingIdentityTokenException = require('../Exceptions/MissingIdentityToken.exception');
const MissingRefreshToken = require('../Exceptions/MissingRefreshToken.exception');

/**
 * @class RequestHelper
 */
class RequestHelper {
    constructor() {
        this.services = {
            cookie: CookieService
        }
    }

    getRefreshToken(request) {
        const clientData = request.applicationSettings;
        const refreshToken = request.body[clientData.COOKIE_JWT_REFRESH_NAME];

        if (refreshToken === null || typeof refreshToken === 'undefined') {
            throw new MissingRefreshToken(`missing token from ${clientData.COOKIE_JWT_REFRESH_NAME}`);
        }

        else {
            return refreshToken;
        }
    }

    getIdentityToken(request) {
        const { applicationSettings, body } = request;
        const identityToken = body[applicationSettings.COOKIE_JWT_ACCESS_NAME];


        if (typeof identityToken !== 'string') {
            throw new MissingIdentityTokenException();
        }

        else {
            return identityToken;
        }
    }

    getRefreshTokenSecret(request) {
        return request.applicationSettings.JWT_SECRET_REFRESHTOKEN;
    }

    getPublicRefreshTokenKey(request) {
        return request.applicationSettings.JWT_PUBLIC_REFRESHTOKEN;
    }

}

module.exports = /** @type {RequestHelper} */ Singleton.create(RequestHelper);

