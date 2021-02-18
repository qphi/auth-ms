const { MicroService, RoutingService, DBHelper } = require('micro');
const recordedRoutes = require('./router/api.router');

const CoreController = require('./controllers/core.controller');
const ApplicationController = require('./controllers/application.controller');

class AuthenticatorMicroService extends MicroService {
    constructor(settings = {}) {
        super(settings);

        this.loadContainer(settings.config).then(container => {
            this.services = {
                // db: new DBService(mock.service),
                jwt: container.services.jwt,
                HTTPSignatureSigner: container.services.HTTPSignatureSigner,
                RSAKeyGenerator: container.services.RSAKeyGenerator,
            };

            const context = {
                ...container,
                services: this.services
            };

            this.app.use((req, res, next) => {
                // https://hackernoon.com/nodejs-express-js-manipulating-response-before-going-back-to-user-5e96ad8d84ca
                const legacySend = res.send;
                const self = this;
                // warning : dont use arrow function, it launch infinite loop
                res.send = function() {
                    self.services.HTTPSignatureSigner.sign(res);
                    legacySend.apply(this, arguments);
                };

                next();
            });

            const router = recordedRoutes({
                ...container,
                controllers: {
                    core: new CoreController(context),
                    application: new ApplicationController(context)
                }
            });

            RoutingService.use(this.app, router);
        });


        this.state = {
            db: null
        };

        this.initializeDBConnexion(process.env.DB_TYPE);
    }

    initializeDBConnexion(db_type) {
    
        if (typeof db_type === 'undefined' && process.env.NODE_ENV !== 'prod') {
            return;
        }

        const credentials = {};

        switch(db_type) {
            case DBHelper.DB_TYPE.DYNAMO:
                credentials.accessKeyId = process.env.DYNAMO_ACCESS_KEY_ID
                credentials.secretAccessKey = process.env.DYNAMO_SECRET_KEY_ID
                credentials.region = process.env.DYNAMO_REGION;
            break;
        }
        
        this.state.db = DBHelper.connect(db_type, credentials);
    }

    async loadContainer(configPath) {
        const config = { ...require(configPath) };
        const factoriesRecorded = config.factory;

        delete config.factory;

        let container = config;

        const sectionPriority = [ 'params', 'services', 'api', 'spi', 'controllers' ];
        const factoriesSectionsName = Object.keys(factoriesRecorded);
        factoriesSectionsName.sort((a, b) => {
           let index_a = sectionPriority.indexOf(a);
           let index_b = sectionPriority.indexOf(b);

           index_a = index_a < 0 ? Number.POSITIVE_INFINITY : index_a;
           index_b = index_b < 0 ? Number.POSITIVE_INFINITY : index_b;

           return index_a - index_b;
        });

       for (let i = 0; i < factoriesSectionsName.length; i++) {
           const section = factoriesSectionsName[i];
            if (typeof container[section] === 'undefined') {
               container[section] = {};
           }

           const factories = factoriesRecorded[section];
           await Promise.all(Object.keys(factories).map(async factoryName => {
               const factory = factories[factoryName];
               const result =  factory(container);

               if (typeof result !== 'undefined' && typeof result.then === 'function') {
                   container[section][factoryName] = await result;
               }

               else {
                   container[section][factoryName] = result
               }
              }));
       }

        return container;
    }
}

module.exports = AuthenticatorMicroService;