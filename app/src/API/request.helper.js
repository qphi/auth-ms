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
        const clientData = request.service;
        const refreshToken = this.services.cookie.get(request, clientData.COOKIE_JWT_REFRESH_NAME);

        if (refreshToken === null) {
            throw new MissingRefreshToken(`missing token from ${clientData.COOKIE_JWT_REFRESH_NAME}`);
        }

        else {
            return refreshToken;
        }
    }

    getIdentityToken(request) {
        const identityToken = request.body.identityToken;

        if (typeof identityToken !== 'string') {
            throw new MissingIdentityTokenException();
        }

        else {
            return identityToken;
        }
    }

    getRefreshTokenSecret(request) {
        return request.service.JWT_SECRET_REFRESHTOKEN;
    }

}

module.exports = /** @type {RequestHelper} */ Singleton.create(RequestHelper);

