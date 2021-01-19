const STATUS_CODE = require('../../config/status-code.config');

module.exports = (context) => {
    return (
        (request, response, next) => {
            try {
                const {applicationSettings} = request;

                if (
                    typeof applicationSettings === 'undefined' ||
                    applicationSettings === null
                ) {
                    throw `Missing settings`;
                }

                const authorization = request.headers['authorization'];
                const public_key = applicationSettings.signaturePublic;
                const hasSignature = typeof authorization === 'string' && authorization.length > 0;
                const hasPublicKey = typeof public_key === 'string' && public_key.length > 0;

                if (hasSignature && hasPublicKey) {
                    if (context.services.httpSignatureVerifier.verify(request, public_key)) {
                        next();
                    }

                    else {
                        return response.status(403).send({
                            message: STATUS_CODE.MISSING_CONFIRM_PASSWORD,
                            status: STATUS_CODE.PROCESS_ABORTED,
                            error: STATUS_CODE.NO_ERROR
                        });
                    }

                }

                else {
                    if (hasSignature) {
                        return response.status(401).json({
                            message: STATUS_CODE.MISSING_HTTP_PUBLIC_KEY,
                            status: STATUS_CODE.PROCESS_ABORTED,
                            error: STATUS_CODE.NO_ERROR
                        });
                    } else if (hasPublicKey) {
                        return response.status(401).json({
                            message: STATUS_CODE.MISSING_SIGNATURE,
                            status: STATUS_CODE.PROCESS_ABORTED,
                            error: STATUS_CODE.NO_ERROR
                        });
                    } else {
                        return next();
                    }
                }
            } catch (error) {
                console.error(error);
                response.status(503).json({
                    message: error.message
                })
            }
        });
}