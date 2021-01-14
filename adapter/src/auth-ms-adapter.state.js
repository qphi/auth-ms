/** @class {AuthAdapterState} */
class AuthAdapterState {
    /**
     * @param {Object} context
     * @param {Object} context.params
     * @param {string} context.params.auth_ms_api_key
     */
    constructor(context) {
        this.api_key =  context.params.auth_ms_api_key || process.env.AUTH_MS_API_KEY;
        this.auth_public_key = null;
        this.jwtRefreshName = context.params.COOKIE_JWT_REFRESH_NAME;
        this.jwtResfreshSecret = context.params.JWT_SECRET_REFRESHTOKEN;
     
        this.jwtAccessName = context.params.COOKIE_JWT_ACCESS_NAME;
        this.jwtAccessSecret = context.params.JWT_SECRET_ACCESSTOKEN;
        this.jwtAccessTTL = context.params.JWT_ACCESS_TTL;

        this.jwtForgotPasswordPublic = context.params.JWT_SECRET_FORGOTPASSWORDTOKEN;

        this.hostname = process.env.AUTH_MS_BASE_URL;
        
        this.endpoints = {
            get_public_key: '/api/public-key',
            login: '/api/login',
            register: '/api/register',
            retrieveSettings: '/api/application/key/',
            refresh: '/api/token/',
            forgotPassword: '/api/forgot-password',
            resetPassword: '/api/reset-password'
        };
    }
}

module.exports = AuthAdapterState;