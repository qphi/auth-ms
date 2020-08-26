const AuthenticatorMicroService = require('./src/authenticator/authenticator.model');
const path = require('path');


const server = new AuthenticatorMicroService({
    env: path.resolve(__dirname, '../.env'),
    views_path: path.resolve(__dirname, './views'),
    assets_path: path.resolve(__dirname, './assets'),
});

server.start();