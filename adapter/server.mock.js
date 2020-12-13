const { MicroService, RoutingService } = require('micro');


const recordedRoutes = require('./src/auth-ms-adapter.router');
const testRoutes = require('./test/test.router');

const AuthenticatorMicroServicePlugin = require('./auth-ms.plugin');

class MockServer extends MicroService {
    constructor(settings = {}) {
        super(settings);

        const container = this.loadContainer(settings.config);

        AuthenticatorMicroServicePlugin(container);


        const readOnlyContainer = { ...container };
        
        const router = recordedRoutes(readOnlyContainer);
        testRoutes(readOnlyContainer).forEach(route => {
            router.push(route);
        });

        RoutingService.use(this.app, router);
    }

    loadContainer(configPath) {
        const config = { ...require(configPath) };
        const factoriesRecorded = config.factories;
        delete config.factories;

        let container = config;
      
        if (Array.isArray(factoriesRecorded) && factoriesRecorded.length > 0) {
            factoriesRecorded.forEach(factory => {
                try {
                    factory(container);
                }

                catch(error) {
                    console.error(error);
                }
            });
        }

        return container;
    }
}

module.exports = MockServer;