const ExpiredTokenException = require('../../app/src/Exceptions/ExpiredToken.exception');
const TokenShouldBeRefreshedException = require('../../app/src/Exceptions/TokenShouldBeRefreshed.exception');
const InvalidTokenException = require('../../app/src/Exceptions/InvalidToken.exception');
const MissingIdentityTokenException = require('../../app/src/Exceptions/MissingIdentityToken.exception');
const MissingRefreshTokenException = require('../../app/src/Exceptions/MissingRefreshToken.exception');

module.exports = (context) => {
    async function redirectToLogin(currentResponse) {
        await context.api.authResponseHelper.clearCredentials(currentResponse);
        currentResponse.redirect('/login');
    }

    function updateIdentityToken(response, token) {
        context.api.authResponseHelper.addIdentityToken(response, token);
    }

    return async (request, response, next) => {
        let identityToken = null;
        let refreshToken = null;

        try {
            identityToken = context.api.authRequestHelper.getIdentityToken(request);
            refreshToken = context.api.authRequestHelper.getRefreshToken(request);

            const payload = await context.services.jwtVerifierService.verify(
                identityToken, 
                context.state.auth_ms.jwtAccessSecret, {
                    ignoreExpiration: true
                }
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
            if (
                error instanceof ExpiredTokenException ||
                error instanceof MissingIdentityTokenException ||
                error instanceof MissingRefreshTokenException
            ) {
                await redirectToLogin(response);
            }

            else if (error instanceof TokenShouldBeRefreshedException) {
                const newIdentityToken = await context.services.authService.refresh(identityToken, refreshToken);
                
                if (newIdentityToken === null) {
                    await redirectToLogin(response);
                }

                else {
                   try {
                    const payload = await context.services.jwtVerifierService.verify(
                        newIdentityToken, 
                        context.state.auth_ms.jwtAccessSecret,
                        {
                            ignoreExpiration: true
                        }
                    );
                    
                    if (payload.user_id) {
                        request.user_id = payload.user_id;
                        updateIdentityToken(response, newIdentityToken);
                        next();
                    }

                    else {
                        await redirectToLogin(response);
                    }
                   } 
                   catch(error) {
                       console.error(error);
                       await redirectToLogin(response);
                    }
                    
                }
            }
        }
    };
}