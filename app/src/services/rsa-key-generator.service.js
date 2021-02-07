// https://www.sohamkamani.com/nodejs/rsa-encryption/
const crypto = require('crypto');

class RsaKeyGeneratorService {
    constructor() {}

    generate() {
        return crypto.generateKeyPairSync("rsa", {
            // The standard secure default length for RSA keys is 2048 bits
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem'
            }
        });
    }
}

module.exports = RsaKeyGeneratorService;