const services = require('./authenticator.mock').servicesRecorded;

module.exports = (request, response, next) => {
    const app = request.body.app;
    const service = services[app] || null;

    if (service === null) {
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