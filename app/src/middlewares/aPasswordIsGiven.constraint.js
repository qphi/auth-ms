const STATUS_CODE = require('../../config/status-code.config');

module.exports = (request, response, next) => {
    const password = request.body.password;

    
    if (
        typeof password === 'string'
    ) {
        next();
    }

    else {
        response.status(401).send({
            message: STATUS_CODE.MISSING_PASSWORD,
            status: STATUS_CODE.PROCESS_ABORTED,
            error: STATUS_CODE.NO_ERROR
        });
    }
}