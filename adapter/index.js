const MockServer = require('./server.mock');

const path = require('path');

const run_env = process.env.NODE_ENV || 'prod';

const server = new MockServer({
    config:  path.resolve(__dirname, './config/' + run_env),
    env: path.resolve(__dirname, `./config/${run_env}/${run_env}.env`)
});


server.start();

module.exports = server.app;