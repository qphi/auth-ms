const { MissingIdentityTokenException } = require('auth-ms-sdk');

/**
 * @class IdentityTokenRequestHelper
 */
class IdentityTokenRequestHelper {
    getToken(request) {
        const {applicationSettings, body} = request;
        const identityToken = body[applicationSettings.COOKIE_JWT_ACCESS_NAME];


        if (typeof identityToken !== 'string') {
            throw new MissingIdentityTokenException();
        } else {
            return identityToken;
        }
    }
}

module.exports = IdentityTokenRequestHelper;

