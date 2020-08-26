const services = require('../authenticator/authenticator.mock').servicesRecorded;

module.exports = (request, response, next) => {
    const app = request.body.app || request.query.app;

    const service = services[app] || null;

    if (service === null) {
        console.log('invalid service');
        response.sendStatus(401);
    }

    else {
        if (typeof service.name === 'undefined') {
            service.name = app;
        }
        
        request.service = service;
        next();
    }
}