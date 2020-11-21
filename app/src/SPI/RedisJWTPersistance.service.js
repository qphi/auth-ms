

const { Singleton } = require('micro'); 

/**
 * @implements {JWTPersistenceInterface}
 */
class RedisJWTPersistence {
    constructor(settings) {
        this.redis = redis.createClient({
            port: settings.REDIS_PORT || process.env.REDIS_PORT, 
            host: settings.REDIS_HOST || process.env.REDIS_HOST, 
            password: settings.REDIS_PASSWORD || process.env.REDIS_PASSWORD 
        });
    }

    /**
     * 
     * @param {string} refreshToken 
     */
    hasRefreshToken(refreshToken = '') {
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

    storeForgotPasswordToken(token, data) {
        return new Promise((resolve, reject) => {
            this.redis.set(token, JSON.stringify(data), 'PX', _6hours, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(true);
                }
            });
        });
    }

    getForgotPasswordToken(token) {
        return new Promise((resolve, reject) => {
            this.redis.get(token, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(JSON.parse(value));
                }
            });
        });
    }

    deleteToken(refreshToken) {
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
}

module.exports = Singleton.create(RedisJWTPersistence);