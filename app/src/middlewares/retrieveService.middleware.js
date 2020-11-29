const services = require('../authenticator/authenticator.mock').servicesRecorded;
const STATUS_CODE = require('../../config/status-code.config');

module.exports = (request, response, next) => {
    const app = request.body.app || request.query.app;

    const service = services[app] || null;

    if (service === null) {
        response.status(401).send({
            message: STATUS_CODE.UNKNOWN_APPLICATION,
            error: STATUS_CODE.NO_ERROR,
            status: STATUS_CODE.PROCESS_ABORTED
        });
    }

    else {
        if (typeof service.name === 'undefined') {
            service.name = app;
        }
        
        request.service = service;
        next();
    }
}