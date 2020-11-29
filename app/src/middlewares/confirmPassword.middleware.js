const STATUS_CODE = require('../../config/status-code.config');

module.exports = (request, response, next) => {
    const { password, confirmPassword } = request.body;

    
    if (
        typeof password !== 'string' ||
        typeof confirmPassword !== 'string'
    ) {
        response.sendStatus(401);
    }

    else {
        if (password !== confirmPassword) {
            response.json({
                message:  STATUS_CODE.PASSWORD_MISMATCH,
                status: STATUS_CODE.PROCESS_ABORTED,
                error: STATUS_CODE.NO_ERROR
            });
        }

        else {
            next();
        }
    }
}