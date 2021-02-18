const RetrieveServiceMiddlewareFactory = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const isGranted = require('../middlewares/isGranted.middleware');

const {
    ConfirmPassword,
    ValidEmail,
    HasPassword,
    Password8LengthMin
} = require('auth-ms-sdk')

/**
 * @param {Object} ctx
 * @return {Array<{method: string, path: string, middlewares: Function[], action: Function}>}
 */
module.exports = ctx => {
    const RetrieveServiceMiddleware = RetrieveServiceMiddlewareFactory(ctx);

    return [
        {
            method: 'get',
            path: '/api/public-key',
            middlewares: [],

            action: (request, response) => {
                ctx.controllers.core.getSignaturePublicKey(request, response, ctx.params.HTTPSignaturePublicKey);
            }
        },

        {
            method: 'post',
            path: '/api/login',
            middlewares: [
                ValidEmail,
                HasPassword,
                RetrieveServiceMiddleware,
                isGranted,
                RetrieveUserMiddleware
            ],

            action: ctx.controllers.core.getMethod('onLogin')
        },

        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        {
            method: 'post',
            path: '/api/logout',
            middlewares: [
                RetrieveServiceMiddleware,
                isGranted
            ],
            action: ctx.controllers.core.getMethod('onLogout')
        },

        {
            method: 'post',
            path: '/api/token',
            middlewares: [
                RetrieveServiceMiddleware,
                isGranted
            ],
            action: ctx.controllers.core.getMethod('generateIdentityToken')
        },

        {
            method: 'post',
            path: '/api/register',
            middlewares: [
                ValidEmail,
                HasPassword,
                Password8LengthMin,
                ConfirmPassword,
                RetrieveServiceMiddleware,
                isGranted,
                RetrieveUserMiddleware
            ],

            action: ctx.controllers.core.getMethod('onRegister')
        },

        {
            method: 'post',
            path: '/api/forgot-password',
            middlewares: [
                ValidEmail,
                RetrieveServiceMiddleware,
                isGranted
            ],

            action: ctx.controllers.core.getMethod('onForgotPassword')
        },

        {
            method: 'post',
            path: '/api/reset-password',
            middlewares: [
                ConfirmPassword,
                RetrieveServiceMiddleware,
                isGranted
            ],

            action: ctx.controllers.core.getMethod('onResetPassword')
        }
    ];
}