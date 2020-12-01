//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const { MicroService, RoutingService, DBHelper } = require('micro');
const DBService = require('../services/db.service');
const APIService = require('../services/api.service');

const mock = require('./authenticator.mock');
const nodemailer = require('nodemailer');

const recordedRoutes = require('./authenticator.router');
const express = require('express');


const CoreController = require('../controllers/core.controller');
const BackOfficeController = require('../controllers/back-office.controller');

class AuthenticatorMicroService extends MicroService {
    constructor(settings = {}) {
        super(settings);



        // const container = require('../DependancyInjection');
        const container = this.loadContainer(settings.config);

        console.log(container);

        this.state = {
            db: null
        };

        this.initializeDBConnexion(process.env.DB_TYPE);
        this.services = {
            // db: new DBService(mock.service),
            jwt: container.services.jwt,
            mailer: nodemailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                   user: process.env.MAILTRAP_USER_ID,
                   pass: process.env.MAILTRAP_PASSWORD
                }
            })
        };

        // this.services.api = new APIService({
        //     services: {
        //         db: this.services.db
        //     }
        // });

        // console.log({
        //     host: 'smtp.mailtrap.io',
        //     port: 2525,
        //     auth: {
        //        user: process.env.MAILTRAP_USER_ID,
        //        pass: process.env.MAILTRAP_PASSWORD
        //     }
        // })

        const router = recordedRoutes({
            ...container,
            controllers: {
                core: new CoreController({
                    ...container,
                    services: this.services
                }),

                bo: new BackOfficeController({
                    services: this.services
                })
            }
        });

      
        this.setupBackOffice(settings);


        RoutingService.use(this.app, router);
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

    loadContainer(configPath) {
        const config = { ...require(configPath) };
        const factoriesRecorded = config.factory;

        delete config.factory;

        let container = config;
        
        Object.keys(factoriesRecorded).forEach(section => {
            if (typeof container[section] === 'undefined') {
                container[section] = {};
            }

            const factories = factoriesRecorded[section];
            Object.keys(factories).forEach(factoryName => {
                const factory = factories[factoryName];
                container[section][factoryName] = factory(container);
            })
        });

        return container;
    }
}

module.exports = AuthenticatorMicroService;