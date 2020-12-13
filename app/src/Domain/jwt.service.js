const { Singleton } = require('micro');
const jwt = require('jsonwebtoken');
const JwtVerifierService = require('./jwt-verifier.service');
class JwtService extends JwtVerifierService {
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

module.exports = Singleton.create(JwtService);