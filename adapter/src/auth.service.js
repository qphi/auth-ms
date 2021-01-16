const https = require('https');
const http = require('http');
const STATUS_CODE = require('../../app/config/status-code.config');

/** @class */
class AuthSPIService {
    constructor(context) {
        /** @type {AuthAdapterState} */
        this.state = context.state.auth_ms;
        this.httpSignatureVerifierService = context.services.httpSignatureVerifier;
    }

    async initialize() {
        const authState = this.state;
        authState.auth_public_key = await this.getPublicKey();

        const settings = await this.get(authState.endpoints.retrieveSettings + authState.api_key);

        authState.jwtRefreshName = settings.COOKIE_JWT_REFRESH_NAME;
        authState.jwtResfreshSecret = settings.JWT_SECRET_REFRESHTOKEN;
        authState.jwtAccessName = settings.COOKIE_JWT_ACCESS_NAME;
        authState.jwtAccessSecret = settings.JWT_SECRET_ACCESSTOKEN;
        authState.jwtAccessTTL = settings.JWT_ACCESS_TTL;
        authState.jwtAccessTTL = settings.JWT_ACCESS_TTL;
        authState.jwtForgotPasswordPublic = settings.JWT_SECRET_FORGOTPASSWORDTOKEN;

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

        let loginAnswer = {};

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

    refresh(identityToken, refreshToken) {
        return new Promise((resolve, reject) => {
            this.post(this.state.endpoints.refresh, {
                [this.state.jwtAccessName]: identityToken,
                [this.state.jwtRefreshName]: refreshToken
            }).then(
                answer => {
                    resolve(answer.headers[this.state.jwtAccessName])
                },

                reject
            )
        });
    }

    register(credentials = {}) {
        return this.post(this.state.endpoints.register, credentials);
    }

    post(endpoint, payload, checkSignature = true) {
        payload.API_KEY = this.state.api_key;
        const payloadString = JSON.stringify(payload);

        return new Promise((resolve, reject) => {
            const request = http.request({
                port: 3370,
                hostname: this.state.hostname,
                path: endpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'AUTH-MS-API-KEY': this.state.api_key,
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
                    let parsedData = {};

                    try {
                        if (checkSignature === true) {
                            this.checkSignature(response);
                        }

                        parsedData = JSON.parse(data);
                    }

                    catch(error) {
                        console.error(error);
                    }

                    finally {
                        resolve({ 
                            headers: response.headers,
                            status: response.statusCode,
                            data: parsedData
                        });
                    }
                });
            });

            request.on('error', reject);
            request.write(payloadString);
            request.end();
        });
    }

    checkSignature(request) {
        if (!this.httpSignatureVerifierService.verify(request, this.state.auth_public_key)) {
            throw `Invalid HTTP Signature`;
        }
    }

    get(endpoint, checkSignature = true) {
        return new Promise((resolve, reject) => {
            const request = http.request({
                port: 3370,
                hostname: this.state.hostname,
                path: endpoint,
                method: 'GET',
                headers: {
                    'auth-ms-api-key': this.state.api_key
                }
            },
            
            response => {
                let data = '';

                // A chunk of data has been received.
                response.on('data', (chunk) => {
                  data += chunk;
                });

                response.on('end', () => {
                    if (checkSignature === true) {
                        this.checkSignature(response);
                    }

                    resolve(JSON.parse(data));
                });
            });

            request.on('error', reject);
            request.end();
        });
    }

    async getPublicKey() {
        // does not check signature cause we don't have any key yet
        const responseData = await this.get(this.state.endpoints.get_public_key, false);
        return responseData.public_key;
    }

    forgotPassword(email) {
        return this.post(this.state.endpoints.forgotPassword, { email });
    }

    resetPassword(payload) {
        return this.post(this.state.endpoints.resetPassword, payload);
    }
}

module.exports = AuthSPIService;