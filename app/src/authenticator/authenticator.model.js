//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const MicroService = require('../microservice.model');
const DBService = require('../services/db.service');
const APIService = require('../services/api.service');

const mock = require('./authenticator.mock');

const sha256 = require('sha256');
const nodemailer = require('nodemailer');

const recordedRoutes = require('./authenticator.router');
const RoutingService = require('../services/routing.service');
const express = require('express');

const _6hours = 21600000;

const JWTService = require('../services/JWTAuthoring.service');


const AuthenticatorAPIController = require('./controllers/AuthenticatorAPI.controller');
const AuthenticatorFrontController = require('./controllers/AuthenticatorFront.controller');


class AuthenticatorMicroService extends MicroService {
    constructor(settings = {}) {
        super(settings);

        this.services = {
            db: new DBService(mock.service),
            jwt: new JWTService(settings),
            mailer: nodemailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                   user: process.env.MAILTRAP_USER_ID,
                   pass: process.env.MAILTRAP_PASSWORD
                }
            })
        };

        this.services.api = new APIService({
            services: {
                db: this.services.db
            }
        });

        console.log({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
               user: process.env.MAILTRAP_USER_ID,
               pass: process.env.MAILTRAP_PASSWORD
            }
        })

        const router = recordedRoutes({
            controllers: {
                api: new AuthenticatorAPIController({
                    services: this.services
                }),

                front: new AuthenticatorFrontController({
                    services: this.services
                })
            }
        });

        this.app.set('views', settings.views_path);
        this.app.set('view engine', 'ejs');


        this.app.use('/assets', express.static(settings.assets_path));

        RoutingService.use(this.app, router);
    }
}

module.exports = AuthenticatorMicroService;