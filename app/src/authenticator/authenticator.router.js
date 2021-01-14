const RetrieveServiceMiddlewareFactory = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const ConfirmPasswordConstraint = require('../middlewares/confirmPassword.middleware');
const EmailIsValid = require('../middlewares/emailIsValid.constraint.middleware');
const PasswordIsNotTooWeakConstraint = require('../middlewares/passwordIsNotTooWeak.constraint.middleware');
const emailIsValidConstraintMiddleware = require('../middlewares/emailIsValid.constraint.middleware');
const aPasswordIsGivenConstraint = require('../middlewares/aPasswordIsGiven.constraint');

const { ResourceRouter } = require('rest-api');

/**
 * 
 * @param {Object} ctx 
 * @return {Array<{method: string, path: string, middlewares: Function[], action: Function}>}
 */
module.exports = ctx => {
    const RetrieveServiceMiddleware = RetrieveServiceMiddlewareFactory(ctx);
    const applicationRouter = ResourceRouter('application', ctx);
    applicationRouter.forEach(route => route.path = `/api${route.path}`);

    return applicationRouter.concat([
        {
            method: 'put',
            path: '/api/application/:_id/enable',
            middlewares: [],
            
            action: ctx.controllers.application.getMethod('enableById')
        },

        {
            method: 'get',
            path: '/api/application/key/:api_key',
            middlewares: [],

            action: ctx.controllers.application.getMethod('findByAPIKey')
        },

        {
            method: 'get',
            path: '/api/public-key',
            middlewares: [],

            action: (request, response) => {
                ctx.controllers.core.getSignaturePublicKey(request, response, ctx.params.HTTPSignaturePublicKey);
            }
        },

        {
            method: 'put',
            path: '/api/application/:_id/disable',
            middlewares: [],
            
            action: ctx.controllers.application.getMethod('disableById')
        },

        {
            method: 'post',
            path: '/api/login',
            middlewares: [
                emailIsValidConstraintMiddleware,
                aPasswordIsGivenConstraint,
                RetrieveServiceMiddleware,
                RetrieveUserMiddleware
            ],
            
            action: ctx.controllers.core.getMethod('onLogin')
        },
        
        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        {
            method: 'post',
            path: '/api/logout',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.core.getMethod('onLogout')
        }, 

        {
            method:'post',
            path: '/api/token',
            middlewares: [ RetrieveServiceMiddleware ],
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
                RetrieveUserMiddleware
            ],
            
            action: ctx.controllers.core.getMethod('onRegister')
        },

        {
            method:'post',
            path: '/api/forgot-password',
            middlewares: [ 
                RetrieveServiceMiddleware,
                EmailIsValid
            ],

            action: ctx.controllers.core.getMethod('onForgotPassword')
        },

        {
            method:'post',
            path: '/api/reset-password',
            middlewares: [
                ConfirmPasswordConstraint,
                RetrieveServiceMiddleware
            ],

            action: ctx.controllers.core.getMethod('onResetPassword')
        },




        /**
         * FRONT
         */
        {
            method:'get',
            path: '/forgot-password',
            middlewares: [ 
                RetrieveServiceMiddleware
            ],

            action: ctx.controllers.bo.getMethod('renderForgetPassword')
        },

        {
            method:'get',
            path: '/login',
            action: ctx.controllers.bo.getMethod('renderLogin')
        },

        {
            method:'get',
            path: '/create-service',
            action: ctx.controllers.bo.getMethod('renderCreateService')
        },

        {
            method:'get',
            path: '/records/:ms_uuid',
            action: ctx.controllers.bo.getMethod('renderShowService')
        },

        {
            method:'get',
            path: '/records',
            action: ctx.controllers.bo.getMethod('renderListServices')
        },

        {
            method:'get',
            path: '/',
            action: ctx.controllers.bo.getMethod('hello')
        }
    ])
}