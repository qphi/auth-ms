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
            message: 'Password must have at leat 8 characters',
            error: 'Password too weak',
            status: 'aborted'
        });
    }
}