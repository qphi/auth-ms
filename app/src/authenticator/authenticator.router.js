const RetrieveServiceMiddlewareFactory = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const ConfirmPasswordConstraint = require('../middlewares/confirmPassword.middleware');
const EmailIsValid = require('../middlewares/emailIsValid.constraint.middleware');
const PasswordIsNotTooWeakConstraint = require('../middlewares/passwordIsNotTooWeak.constraint.middleware');
const emailIsValidConstraintMiddleware = require('../middlewares/emailIsValid.constraint.middleware');
const aPasswordIsGivenConstraint = require('../middlewares/aPasswordIsGiven.constraint');
const isGranted = require('../middlewares/isGranted.middleware');
const CheckHTTPSignatureFactory = require('../middlewares/checkHTTPSignature.middleware');

const {ResourceRouter} = require('rest-api');

/**
 * @param {Object} ctx
 * @return {Array<{method: string, path: string, middlewares: Function[], action: Function}>}
 */
module.exports = ctx => {
    const RetrieveServiceMiddleware = RetrieveServiceMiddlewareFactory(ctx);
    const checkHTTPSignature = CheckHTTPSignatureFactory(ctx);


    /////////////////////////////////////////////////////////////////////////
    // APPLICATION
    /////////////////////////////////////////////////////////////////////////

    const applicationRouter = ResourceRouter('application', ctx).filter(
        route => route.path !== '/application'
    );

    applicationRouter.forEach(route => {
        route.path = route.path.replace(':_id', ':ms_id');


        route.path = `/api${route.path}`;
        if (!Array.isArray(route.middlewares)) {
            route.middlewares = [];
        }

        route.middlewares.push(
            RetrieveServiceMiddleware,
            checkHTTPSignature,
            isGranted
        );
    });

    return (
        /** @type {Array<{method: string, path: string, middlewares: Function[], action: Function}>} **/
        applicationRouter.concat([
            {
                method: 'put',
                path: '/api/application/:ms_id/enable',
                middlewares: [
                    RetrieveServiceMiddleware,
                    checkHTTPSignature,
                    isGranted
                ],

                action: ctx.controllers.application.getMethod('enableById')
            },

            {
                method: 'put',
                path: '/api/application/:ms_id/public_key',
                middlewares: [RetrieveServiceMiddleware, isGranted],

                action: ctx.controllers.application.getMethod('setPublicKey')
            },

            {
                method: 'put',
                path: '/api/application/:ms_id/disable',
                middlewares: [RetrieveServiceMiddleware, checkHTTPSignature, isGranted],

                action: ctx.controllers.application.getMethod('disableById')
            },

            {
                method: 'get',
                path: '/api/application',
                middlewares: [RetrieveServiceMiddleware, isGranted, checkHTTPSignature],

                action: ctx.controllers.application.getMethod('findByAPIKey')
            },

            /////////////////////////////////////////////////////////////////////////
            // CORE
            /////////////////////////////////////////////////////////////////////////

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
                    emailIsValidConstraintMiddleware,
                    aPasswordIsGivenConstraint,
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
                    EmailIsValid,
                    aPasswordIsGivenConstraint,
                    PasswordIsNotTooWeakConstraint,
                    ConfirmPasswordConstraint,
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
                    EmailIsValid,
                    RetrieveServiceMiddleware,
                    isGranted
                ],

                action: ctx.controllers.core.getMethod('onForgotPassword')
            },

            {
                method: 'post',
                path: '/api/reset-password',
                middlewares: [
                    ConfirmPasswordConstraint,
                    RetrieveServiceMiddleware,
                    isGranted
                ],

                action: ctx.controllers.core.getMethod('onResetPassword')
            },


            /**
             * FRONT
             */
            {
                method: 'get',
                path: '/forgot-password',
                middlewares: [
                    RetrieveServiceMiddleware
                ],

                action: ctx.controllers.bo.getMethod('renderForgetPassword')
            },

            {
                method: 'get',
                path: '/login',
                action: ctx.controllers.bo.getMethod('renderLogin')
            },

            {
                method: 'get',
                path: '/create-service',
                action: ctx.controllers.bo.getMethod('renderCreateService')
            },

            {
                method: 'get',
                path: '/records/:ms_uuid',
                action: ctx.controllers.bo.getMethod('renderShowService')
            },

            {
                method: 'get',
                path: '/records',
                action: ctx.controllers.bo.getMethod('renderListServices')
            },

            {
                method: 'get',
                path: '/',
                action: ctx.controllers.bo.getMethod('hello')
            }
        ])
    );
}