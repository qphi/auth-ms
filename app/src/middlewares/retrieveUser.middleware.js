const sha256 = require('sha256');

module.exports = (request, response, next) => {
    const { email, password } = request.body;

    if (
        typeof email === 'undefined' ||
        typeof password === 'undefined'
    ) {
        response.sendStatus(401);
    }

    else {
        if (typeof request.user === 'undefined') {
            request.user = {};
        }

        if (typeof  request.body.confirmPassword !== 'undefined') {
            request.user.confirmPassword = sha256(request.body.confirmPassword);
        }

        request.user.email = sha256(email);
        request.user.password = sha256(password);

        next();
    }
}