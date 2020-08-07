const sha256 = require('sha256');

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
                message: 'password mismatch',
                status: 'aborted'
            });
        }

        else {
            next();
        }
    }
}