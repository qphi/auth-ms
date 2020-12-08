const { MicroService, RoutingService, DBHelper } = require('micro');

const path = require('path');

const run_env = process.env.NODE_ENV || 'prod';

const server = new MicroService({
    config:  path.resolve(__dirname, './config/' + run_env),
    env: path.resolve(__dirname, `../${run_env}.env`)
});

const router = recordedRoutes({
    controllers: {
        // core: new CoreController(context),
        // application: new ApplicationController(context),
        // bo: new BackOfficeController(context)
    }
});


RoutingService.use(server.app, router);

server.start();

module.exports = server.app;