const STATUS_CODE = require('../../config/status-code.config');

module.exports = (request, response, next) => {
    const { password, confirmPassword } = request.body;

    
    if (typeof confirmPassword !== 'string') {
        response.status(401).send({
            message:  STATUS_CODE.MISSING_CONFIRM_PASSWORD,
            status: STATUS_CODE.PROCESS_ABORTED,
            error: STATUS_CODE.NO_ERROR
        });
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