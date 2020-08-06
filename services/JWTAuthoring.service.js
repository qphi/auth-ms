const redis = require('redis');
const jwt = require('jsonwebtoken');

const day_in_ms = 864000000;


class JWTAuthoringService {
    constructor(settings) {
        this.redis = redis.createClient({
            port: settings.REDIS_PORT || process.env.REDIS_PORT, 
            host: settings.REDIS_HOST || process.env.REDIS_HOST, 
            password: settings.REDIS_PASSWORD || process.env.REDIS_PASSWORD 
        });
    }

    hasRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.get(refreshToken, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(value === '1');
                }
            });
        });
    }

    storeRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.set(refreshToken, '1', 'PX', day_in_ms, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(value === '1');
                }
            });
        });
    }

    deleteRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.del(refreshToken, err => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve();
                }
            });
        });
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