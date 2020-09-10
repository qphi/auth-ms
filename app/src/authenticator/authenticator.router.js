

const RetrieveServiceMiddleware = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const ConfirmPasswordConstraint = require('../middlewares/confirmPassword.middleware');
const EmailIsValid = require('../middlewares/emailIsValid.constraint.middleware');

module.exports = ctx => {
    return [
        {
            method: 'post',
            path: '/api/login',
            middlewares: [
                RetrieveServiceMiddleware,
                RetrieveUserMiddleware

            ],
            
            action: ctx.controllers.api.getMethod('onLogin')
        },
        
        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        {
            method: 'post',
            path: '/api/logout',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.api.getMethod('onLogout')
        }, 

        {
            method:'get',
            path: '/api/token',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.api.getMethod('generateNewAccessToken')
        },

        {
            method: 'post',
            path: '/api/register',
            middlewares: [ 
                ConfirmPasswordConstraint,
                RetrieveServiceMiddleware 
            ],
            
            action: ctx.controllers.api.getMethod('onRegister')
        },

        {
            method:'post',
            path: '/api/forgot-password',
            middlewares: [ 
                RetrieveServiceMiddleware,
                EmailIsValid
            ],

            action: ctx.controllers.api.getMethod('onForgotPassword')
        },

        {
            method:'post',
            path: '/api/reset-password',
            middlewares: [
                ConfirmPasswordConstraint,
                RetrieveServiceMiddleware
            ],

            action: ctx.controllers.api.getMethod('onResetPassword')
        },

        {
            method:'post',
            path: '/api/create-service',
            middlewares: [],

            action: ctx.controllers.api.getMethod('onCreateService')
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

            action: ctx.controllers.front.getMethod('renderForgetPassword')
        },

        {
            method:'get',
            path: '/login',
            action: ctx.controllers.front.getMethod('renderLogin')
        },

        {
            method:'get',
            path: '/create-service',
            action: ctx.controllers.front.getMethod('renderCreateService')
        },

        {
            method:'get',
            path: '/records/:ms_uuid',
            action: ctx.controllers.front.getMethod('renderShowService')
        },


        {
            method:'get',
            path: '/records',
            action: ctx.controllers.front.getMethod('renderListServices')
        },
    ]
}