const { MissingRefreshTokenException } = require('auth-ms-sdk');

class RefreshTokenRequestHelper {
    constructor(context) {
    }

    getToken(request) {
        const clientData = request.applicationSettings;
        const refreshToken = request.body[clientData.COOKIE_JWT_REFRESH_NAME];

        if (refreshToken === null || typeof refreshToken === 'undefined') {
            throw new MissingRefreshTokenException(`missing token from ${clientData.COOKIE_JWT_REFRESH_NAME}`);
        }

        else {
            return refreshToken;
        }
    }

    getPublicKey(request) {
        return request.applicationSettings.JWT_PUBLIC_REFRESHTOKEN;
    }
}

module.exports = RefreshTokenRequestHelper;