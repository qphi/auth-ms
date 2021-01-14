//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const { MicroService, RoutingService, DBHelper } = require('micro');

const nodemailer = require('nodemailer');

const recordedRoutes = require('./authenticator.router');
const express = require('express');


const CoreController = require('../controllers/core.controller');
const BackOfficeController = require('../controllers/back-office.controller');
const ApplicationController = require('../controllers/application.controller');

class AuthenticatorMicroService extends MicroService {
    constructor(settings = {}) {
        super(settings);

        // const container = require('../DependancyInjection');
        this.loadContainer(settings.config).then(container => {
            this.services = {
                // db: new DBService(mock.service),
                jwt: container.services.jwt,
                HTTPSignatureSigner: container.services.HTTPSignatureSigner,
                mailer: nodemailer.createTransport({
                    host: 'smtp.mailtrap.io',
                    port: 2525,
                    auth: {
                        user: process.env.MAILTRAP_USER_ID,
                        pass: process.env.MAILTRAP_PASSWORD
                    }
                })
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
                    application: new ApplicationController(context),
                    bo: new BackOfficeController(context)
                }
            });


            this.setupBackOffice(settings);


            RoutingService.use(this.app, router);
        });


        this.state = {
            db: null
        };

        this.initializeDBConnexion(process.env.DB_TYPE);

    }

    /**
     * @param {Object} settings 
     * @param {string} settings.views_path path to directory containing template files
     * @param {string} settings.assets_path path to directory containing our public assets
     */
    setupBackOffice(settings = {}) {
        this.app.set('views', settings.views_path);
        this.app.set('view engine', 'ejs');
        this.app.use('/assets', express.static(settings.assets_path));
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