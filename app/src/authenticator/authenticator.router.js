const RetrieveServiceMiddlewareFactory = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const ConfirmPasswordConstraint = require('../middlewares/confirmPassword.middleware');
const EmailIsValid = require('../middlewares/emailIsValid.constraint.middleware');
const PasswordIsNotTooWeakConstraint = require('../middlewares/passwordIsNotTooWeak.constraint.middleware');
const emailIsValidConstraintMiddleware = require('../middlewares/emailIsValid.constraint.middleware');
const aPasswordIsGivenConstraint = require('../middlewares/aPasswordIsGiven.constraint');

/**
 * 
 * @param {Object} ctx 
 * @return {Array<{method: string, path: string, middlewares: Function[], action: Function}>}
 */
module.exports = ctx => {
    const RetrieveServiceMiddleware = RetrieveServiceMiddlewareFactory(ctx);
    return [
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
            method:'get',
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

        {
            method:'post',
            path: '/api/create-service',
            middlewares: [],

            action: ctx.controllers.core.getMethod('onCreateService')
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
        }
    ]
}