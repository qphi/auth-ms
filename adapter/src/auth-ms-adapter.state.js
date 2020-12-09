/** @class {AuthAdapterState} */
class AuthAdapterState {
    constructor(context) {
        this.api_key =  context.params.auth_ms_api_key || process.env.AUTH_MS_API_KEY;
        this.jwtRefreshName = context.params.COOKIE_JWT_REFRESH_NAME;
        this.jwtResfreshSecret = context.params.JWT_SECRET_REFRESHTOKEN;
     
        this.jwtAccessName = context.params.COOKIE_JWT_ACCESS_NAME;
        this.jwtAccessSecret = context.params.JWT_SECRET_ACCESSTOKEN;
        this.jwtAccessTTL = context.params.JWT_ACCESS_TTL;

        const base_url = process.env.AUTH_MS_BASE_URL;

        this.hostname = base_url;
        
        this.endpoints = {
            login: '/api/login',
            register: '/api/register'
        };
    }
}

module.exports = AuthAdapterState;