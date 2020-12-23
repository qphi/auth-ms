const jwt = require('jsonwebtoken');
const ExpiredTokenException = require('../Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../Exceptions/TokenShouldBeRefreshed.exception');

class JwtVerifierService {
    /**
     * 
     * @param {string} token 
     * @param {string} secret 
     * @param {Object} options 
     * @param {Boolean} options.ignoreExpiration Does not throw an error if exp date is expired 
     * @param {Boolean} options.ignorePreventExpiration Does not throw an error if expiration date is expired or if service consider that token should be refreshed 
     */
    verify(token, secret, options = { ignoreExpiration: false, ignorePreventExpiration: false }) {
        return new Promise(async (resolve, reject) => {
            let payload = null;
            try {
                payload = await jwt.verify(token, secret, options);
            
                console.log("payload ==", payload);
            }

            catch(error) {
                if (error.name === 'TokenExpiredError') {
                    // overwrite lib-error by our own domain error
                    reject(new ExpiredTokenException());
                }

                else {
                    reject(error);
                }
            }

            const nowInSeconds = Math.ceil(Date.now() / 1000);
           
            if (options.ignorePreventExpiration !== true && payload.expire < nowInSeconds) {
                reject(new TokenShouldBeRefreshedException());
            }
            
            else {
                resolve(payload);
            }
        });
    }
}

module.exports = JwtVerifierService;