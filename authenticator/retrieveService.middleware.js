const services = require('./authenticator.mock').servicesRecorded;

module.exports = (request, response, next) => {
    const app = request.body.app;
    const service = services[app] || null;

    if (service === null) {
        response.sendStatus(401);
    }

    else {
        request.service = service;
        next();
    }
}