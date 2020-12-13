const https = require('https');
const http = require('http');
const STATUS_CODE = require('../../app/config/status-code.config');

/** @class */
class AuthSPIService {
    constructor(context) {
        /** @type {AuthAdapterState} */
        this.state = context.state.auth_ms;
    }

    async initialize() {
        const settings = await this.get(this.state.endpoints.retrieveSettings + this.state.api_key);

        console.log('settings', settings);
        this.state.jwtRefreshName = settings.COOKIE_JWT_REFRESH_NAME;
        this.state.jwtResfreshSecret = settings.JWT_SECRET_REFRESHTOKEN;
     
        this.state.jwtAccessName = settings.COOKIE_JWT_ACCESS_NAME;
        this.state.jwtAccessSecret = settings.JWT_SECRET_ACCESSTOKEN;
        this.state.jwtAccessTTL = settings.JWT_ACCESS_TTL;

        console.log('state', this.state);
    }

    /**
     * @param {Object} credentials 
     * @param {string} credentials.email 
     * @param {string} credentials.password 
     * 
     * @returns {{ success: Boolean, identityToken: string, refreshToken: string, status: Number}} loginAnswer
     */
    async login(credentials = {}) {
        const result = await this.post(this.state.endpoints.login, credentials);

        console.log('login result', result);

        let loginAnswer = {};

        console.log('identity token name', this.state.jwtAccessName)
        console.log('jwtRefreshName token name', this.state.jwtRefreshName)
        if (
            result.status === 200 &&
            result.data.message === STATUS_CODE.LOGIN_SUCCESSFUL
        ) {
            loginAnswer.success = true;
            loginAnswer.identityToken = result.headers[this.state.jwtAccessName];
            loginAnswer.refreshToken = result.headers[this.state.jwtRefreshName];
        }

        else {
            loginAnswer.message = result.data.message;
            loginAnswer.status = loginAnswer.status;
            loginAnswer.success = false;
        }

        return loginAnswer; 
    }

    register(credentials = {}) {
        return this.post(this.state.endpoints.register, credentials);
    }

    post(endpoint, payload) {
        payload.API_KEY = this.state.api_key;
        const payloadString = JSON.stringify(payload);
        console.log(`POST ${this.state.hostname}${endpoint}`);
        console.log('body', payload);

        return new Promise((resolve, reject) => {
            const request = http.request({
                port: 3370,
                hostname: this.state.hostname,
                path: endpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': payloadString.length
                }
            },
            
            response => {
                let data = '';

                // A chunk of data has been received.
                response.on('data', (chunk) => {
                  data += chunk;
                });

                response.on('end', () => {
                    resolve({ 
                        headers: response.headers,
                        status: response.statusCode,
                        data: JSON.parse(data) 
                    });
                });
            });

            request.on('error', reject);
            request.write(payloadString);
            request.end();
        });
    }

    get(endpoint) {
        return new Promise((resolve, reject) => {
            const request = http.request({
                port: 3370,
                hostname: this.state.hostname,
                path: endpoint,
                method: 'GET'
            },
            
            response => {
                let data = '';

                // A chunk of data has been received.
                response.on('data', (chunk) => {
                  data += chunk;
                });

                response.on('end', () => {
                    resolve(JSON.parse(data));
                });
            });

            request.on('error', reject);
            request.end();
        });
    }
}

module.exports = AuthSPIService;