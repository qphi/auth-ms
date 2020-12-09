const { MicroService, RoutingService } = require('micro');


const recordedRoutes = require('./src/auth-ms-adapter.router');
const AuthenticatorMicroServicePlugin = require('./auth-ms.plugin');

class MockServer extends MicroService {
    constructor(settings = {}) {
        super(settings);

        // const container = require('../DependancyInjection');
        const container = this.loadContainer(settings.config);
        console.log('original container', container);

        AuthenticatorMicroServicePlugin(container);

        console.log('container with plugin', container);

        const router = recordedRoutes({ ...container });
        RoutingService.use(this.app, router);
    }

    loadContainer(configPath) {
        const config = { ...require(configPath) };
        const factoriesRecorded = config.factory;

      

        delete config.factory;

        let container = config;
        if (
            typeof factoriesRecorded !== 'undefined' &&
            factoriesRecorded !== null
        ) {
            console.log('factory recorded', factoriesRecorded,  Object.keys(factoriesRecorded))
            Object.keys(factoriesRecorded).forEach(section => {
                console.log(container, section)
                if (typeof container[section] === 'undefined') {
                    container[section] = {};
                }
    
                const factories = factoriesRecorded[section];
                Object.keys(factories).forEach(factoryName => {
                    const factory = factories[factoryName];
                    container[section][factoryName] = factory(container);
                })
            });
        }
      

        return container;
    }
}

module.exports = MockServer;