const {Singleton} = require('micro');
const jwt = require('jsonwebtoken');
const JwtVerifierService = require('./jwt-verifier.service');

class JwtService extends JwtVerifierService {
    /**
     * @param {Mixed} data
     * @param {string} secret
     * @param {Number} ttl
     */
    sign(data, secret, ttl) {
        const options = ttl ? {expiresIn: ttl} : {};
        options.algorithm = 'RS256';
        return jwt.sign(data, secret, options);
    }
}

module.exports = Singleton.create(JwtService);