const fs = require('fs');
const path = require('path');

class HttpSignaturePublicKeyProvider {
    constructor() {
    }

    provide() {
        return new Promise(resolve => {
            const filePath = path.resolve(__dirname, '../../keys/auth-ms-dev-public');
            fs.readFile(filePath, 'ascii', (err, data) => {
                console.log(filePath, data);
                resolve(data);
            });
        });
    }
}

module.exports = HttpSignaturePublicKeyProvider;