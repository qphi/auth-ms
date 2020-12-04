const services = require('../authenticator/authenticator.mock').servicesRecorded;
const STATUS_CODE = require('../../config/status-code.config');

module.exports = (context) => {
    return (
        async (request, response, next) => {
            try {
                const API_KEY = request.body.API_KEY || request.query.API_KEY;

                if (typeof API_KEY === 'undefined') {
                    return response.status(401).send({
                        message: STATUS_CODE.MISSING_API_KEY,
                        error: STATUS_CODE.NO_ERROR,
                        status: STATUS_CODE.PROCESS_ABORTED
                    });
                }

                const service = await context.spi.customerApplicationPersistence.findByAPIKey(API_KEY);

                if (service === null) {
                    return response.status(401).send({
                        message: STATUS_CODE.UNKNOWN_APPLICATION,
                        error: STATUS_CODE.NO_ERROR,
                        status: STATUS_CODE.PROCESS_ABORTED
                    });
                }
    
                else {
                    if (typeof service.name === 'undefined') {
                        service.name = service.NAME;
                    }
                    
                    request.service = service;
                    next();
                }
            }

            catch(error) {
                console.error(error);
                return response.status(500).send({
                    error: STATUS_CODE.WITH_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED
                });
            }
           
        }
    );
}