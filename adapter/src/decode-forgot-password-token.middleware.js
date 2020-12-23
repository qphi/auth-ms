const ExpiredTokenException = require('../../app/src/Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../../app/src/Exceptions/TokenShouldBeRefreshed.exception');

const STATUS_CODE = require('../../app/config/status-code.config');

module.exports = (context) => {
    return async (request, response, next) => {
        
        const forgotPasswordToken = request.query.token;
        console.log('== decode token ==', forgotPasswordToken);

        try {
            const payload = await context.services.jwtVerifierService.verify(
                forgotPasswordToken,
                context.state.auth_ms.jwtForgotPasswordPublic
            );
            console.log("decoced payload", payload)
            request.tokenPayload = payload;
            next();
        }

        catch(error) {
            if (
                error instanceof ExpiredTokenException ||
                error instanceof TokenShouldBeRefreshedException
            ) {
                response.status(401).json({
                    status: STATUS_CODE.PROCESS_ABORTED,
                    error: STATUS_CODE.NO_ERROR,
                    message: error.constructor.name
                })
            }

            else {
                console.error(error);
                response.status(500).json({
                    status: STATUS_CODE.PROCESS_ABORTED,
                    error: STATUS_CODE.WITH_ERROR,
                    message: error.constructor.name
                });
            }
        }
    };
}