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

                const applicationSettings = await context.spi.customerApplicationPersistence.findByAPIKey(API_KEY);

                if (applicationSettings === null) {
                    return response.status(401).send({
                        message: STATUS_CODE.UNKNOWN_APPLICATION,
                        error: STATUS_CODE.NO_ERROR,
                        status: STATUS_CODE.PROCESS_ABORTED
                    });
                }
    
                else {
                    if (typeof applicationSettings.name === 'undefined') {
                        applicationSettings.name = applicationSettings.NAME;
                    }
                    
                    request.applicationSettings = applicationSettings;

                    console.log(applicationSettings);
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