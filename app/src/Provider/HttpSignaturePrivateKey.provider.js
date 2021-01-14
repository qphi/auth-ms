const fs = require('fs');
const path = require('path');

class HttpSignaturePrivateKeyProvider {
    constructor() {
    }

    provide() {
        return new Promise(resolve => {
            const filePath = path.resolve(__dirname, '../../keys/auth-ms-dev-private.ppk');
            fs.readFile(filePath, 'ascii',(err, data) => {
                resolve(data);
            });
        });
    }
}

module.exports = HttpSignaturePrivateKeyProvider;