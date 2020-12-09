const https = require('https');

class AuthSPIService {
    constructor(context) {
        /** @type {AuthAdapterState} */
        this.state = context.state.auth_ms;
    }

    login(credentials = {}) {
        return this.post(this.state.endpoints.login, credentials);
    }

    register(credentials = {}) {
        return this.post(this.state.endpoints.register, credentials);
    }

    post(endpoint, payload) {
        payload.API_KEY = this.state.API_KEY;
        const payloadString = JSON.stringify(payload);
        return new Promise((resolve, reject) => {
            const request = https.request({
                protocol: 'http',
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
                resp.on('data', (chunk) => {
                  data += chunk;
                });

                response.on('end', () => {
                    console.log(endpoint, 'request end :', data);
                    resolve(data);
                });
            });

            request.on('error', reject);
            request.write(payloadString);
            request.end();
        });
    }
}

module.exports = AuthSPIService;