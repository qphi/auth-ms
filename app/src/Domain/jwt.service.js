const { Singleton } = require('micro');
const jwt = require('jsonwebtoken');
const JWTVerifierService = require('./jwt-verifier.service');
class JWTService extends JWTVerifierService {
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
}

module.exports = Singleton.create(JWTService);