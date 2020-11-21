const jwt = require('jsonwebtoken');
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');

const day_in_ms = 864000000;
const _6hours = 21600000;

class JWTService {
    constructor(settings = {}) {
        this.api = settings.api;
        this.spi = settings.spi;
    }

    async getRefreshToken(request) {
        const refreshToken = this.api.requestAdapter.getRefreshToken(request);
        
        if (await this.spi.jwtPeristence.hasRefreshToken(refreshToken)) {
            throw new InvalidTokenException();
        }

        return refreshToken;
    }

    getClientSettings(request) {
        return request.service;
    }
 
    sign(data, secret, ttl) {
        return jwt.sign(data, secret,         
            ttl ? { expiresIn: ttl + 'ms' } : {}
        );
    }

    verify(token, secret) {
        return new Promise((resolve, reject) => {
            jwt.verify(token, secret, (err, user) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(user);
                }
            });
        });
    }
}

module.exports = JWTAuthoringService;