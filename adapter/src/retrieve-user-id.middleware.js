const ExpiredTokenException = require('../../app/src/Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../../app/src/Exceptions/TokenShouldBeRefreshed.exception');
const InvalidTokenException = require('../../app/src/Exceptions/InvalidToken.exception');
const MissingIdentityTokenException = require('../../app/src/Exceptions/MissingIdentityToken.exception');
const MissingRefreshTokenException = require('../../app/src/Exceptions/MissingRefreshToken.exception');

module.exports = (context) => {
    return async (request, response, next) => {
        let identityToken = null;
        try {
            identityToken = context.api.authRequestHelper.getIdentityToken(request);

            const payload = await context.services.jwtVerifierService.verify(
                identityToken, 
                context.state.auth_ms.jwtAccessSecret
            );
            
            if (payload.user_id) {
                request.user_id = payload.user_id;
                next();
            }

            else {
                throw new InvalidTokenException('missing user_id');
            }
        }

        catch(error) {
            console.error(error);
            if (
                error instanceof ExpiredTokenException ||
                error instanceof MissingIdentityTokenException ||
                error instanceof MissingRefreshTokenException
            ) {
                response.redirect('/login');
            }

            else if (error instanceof TokenShouldBeRefreshedException) {
                // @todo
                // context.services.aut
                // todo => contacter le auth-ms pour lui demander un refresh
            }
        }
    };
}