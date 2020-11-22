const { Singleton } = require('micro');
const jwt = require('jsonwebtoken');

class JWTService {
    /**
     * @param {Mixed} data 
     * @param {string} secret 
     * @param {Number} ttl 
     */
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

module.exports = Singleton.create(JWTService);