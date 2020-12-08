const services = require('../authenticator/authenticator.mock').servicesRecorded;
const STATUS_CODE = require('../../config/status-code.config');
const JWTVerifierService = require('../../app/src/Domain/jwt-verifier.service');
const ExpiredTokenException = require('../../app/src/Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../../app/src/Exceptions/TokenShouldBeRefreshed.exception');
const InvalidTokenException = require('../../app/src/Exceptions/InvalidToken.exception');

module.exports = (context) => {
    return (
        async (request, response, next) => {
            let identityToken = null;
            try {
                identityToken = context.api.authRequestHelper.getIdentityToken(request);
                const payload = context.services.JWTVerifierService(identityToken, context.param.authJwtSecretIdentityToken);

                if (payload.user_id) {
                    request.user_id = payload.user_id;
                    next();
                }

                else {
                    throw new InvalidTokenException('missing user_id');
                }
            }

            catch(error) {
                if (error instanceof ExpiredTokenException) {
                    response.redirect('/login');
                }

                else if (error instanceof TokenShouldBeRefreshedException) {
                    // context.services.aut
                    // todo => contacter le auth-ms pour lui demander un refresh
                }
            }
        }
    );
}