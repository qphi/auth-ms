const { Singleton } = require('micro');
const jwt = require('jsonwebtoken');
const ExpiredTokenException = require('../Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../Exceptions/TokenShouldBeRefreshed.exception');

class JWTVerifierService {
    verify(token, secret) {
        return new Promise(async resolve => {
            let payload = null;
            try {
                payload = await jwt.verify(token, secret);
            }

            catch(error) {
                // send error to auth-ms service ?
                if (error.name === 'TokenExpired') {
                    throw new ExpiredTokenException();
                }
            }

            
            if (payload.expires >= Date.now()) {
                throw new TokenShouldBeRefreshedException();
            }
            
            else {
                resolve(payload);
            }
        });
    }
}

module.exports = JWTVerifierService;