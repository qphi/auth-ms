const MicroService = require('./microservice.model');
const jwt = require('jsonwebtoken');

class JWTMicroService {
    construct(settings = {}) {
        super(settings);

        const env = process.env;
        
        this.jwtSecretAccessToken = env.JWT_SECRET_ACCESSTOKEN;

        this.jwtAccessTTL = env.JWT_ACCESS_TTL;

        this.cookieJwtAccessName =  env.COOKIE_JWT_ACCESS_NAME;
        this.cookieJwtRefreshName =  env.COOKIE_JWT_REFRESH_NAME;
    }
}

module.exports = JWTMicroService;