const AuthenticatorMicroService = require('./src/authenticator/authenticator.model');
const path = require('path');

const run_env = process.env.NODE_ENV || 'prod';

const server = new AuthenticatorMicroService({
    config:  path.resolve(__dirname, './config/' + run_env),
    env: path.resolve(__dirname, `../${run_env}.env`),
    views_path: path.resolve(__dirname, './views'),
    assets_path: path.resolve(__dirname, './assets'),
});

server.start();

module.exports = server.app;