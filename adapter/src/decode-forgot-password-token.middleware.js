const ExpiredTokenException = require('../../app/src/Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../../app/src/Exceptions/TokenShouldBeRefreshed.exception');

const STATUS_CODE = require('../../app/config/status-code.config');

module.exports = (context) => {
    return async (request, response, next) => {
        const forgotPasswordToken = request.query.token;

        try {
            response.tokenPayload = await context.services.jwtVerifierService.verify(
                forgotPasswordToken,
                context.state.auth_ms.jwtForgotPasswordSecret
            );
        }

        catch(error) {
            if (
                error instanceof ExpiredTokenException ||
                error instanceof TokenShouldBeRefreshedException
            ) {
                return response.status(401).json({
                    status: STATUS_CODE.PROCESS_ABORTED,
                    error: STATUS_CODE.NO_ERROR,
                    message: error.constructor.name
                })
            }

            else {
                console.error(error);
                return response.status(500).json({
                    status: STATUS_CODE.PROCESS_ABORTED,
                    error: STATUS_CODE.WITH_ERROR,
                    message: error.constructor.name
                });
            }
        }

        next();
    };
}