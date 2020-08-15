

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
            
            action: ctx.controllers.authenticatorController.getMethod('onLogin')
        },
        
        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        {
            method: 'post',
            path: '/api/logout',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.authenticatorController.getMethod('onLogout')
        }, 

        {
            method:'get',
            path: '/api/token',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.authenticatorController.getMethod('generateNewAccessToken')
        },

        {
            method: 'post',
            path: '/api/register',
            middlewares: [ 
                ConfirmPasswordConstraint,
                RetrieveServiceMiddleware 
            ],
            
            action: ctx.controllers.authenticatorController.getMethod('onRegister')
        },

        {
            method:'post',
            path: '/api/forgot-password',
            middlewares: [ 
                RetrieveServiceMiddleware,
                EmailIsValid
            ],

            action: ctx.controllers.authenticatorController.getMethod('onForgotPassword')
        },

        {
            method:'post',
            path: '/api/reset-password',
            middlewares: [
                ConfirmPasswordConstraint,
                RetrieveServiceMiddleware
            ],

            action: ctx.controllers.authenticatorController.getMethod('onResetPassword')
        },
    ]
}