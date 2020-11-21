const emailRegexp = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;

module.exports = (request, response, next) => {
    const email = request.body.email;

    
    if (
        typeof email === 'string' &&
        email.match(emailRegexp) !== null
    ) {
        next();
    }

    else {
        console.log('invalid email');
        response.sendStatus(401);
    }
}