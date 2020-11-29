const STATUS_CODE = require('../../config/status-code.config');

module.exports = (request, response, next) => {
    const password = request.body.password;

    
    if (
        typeof password === 'string' &&
        password.length >= 8
    ) {
        next();
    }

    else {
        response.status(200).send({
            message: STATUS_CODE.PASSWORD_TOO_WEAK,
            error: false,
            status: STATUS_CODE.PROCESS_ABORTED
        });
    }
}