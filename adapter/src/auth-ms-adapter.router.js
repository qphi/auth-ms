const RetrieveServiceMiddlewareFactory = require('../../app/src/middlewares/retrieveService.middleware')
const RetrieveUserMiddleware = require('../../app/src/middlewares/retrieveUser.middleware');
const ConfirmPasswordConstraint = require('../../app/src/middlewares/confirmPassword.middleware');
const EmailIsValid = require('../../app/src/middlewares/emailIsValid.constraint.middleware');
const PasswordIsNotTooWeakConstraint = require('../../app/src/middlewares/passwordIsNotTooWeak.constraint.middleware');
const emailIsValidConstraintMiddleware = require('../../app/src/middlewares/emailIsValid.constraint.middleware');
const aPasswordIsGivenConstraint = require('../../app/src/middlewares/aPasswordIsGiven.constraint');

module.exports = ctx => {
    return [
        {
            method: 'post',
            path: '/api/login',
            middlewares: [
                emailIsValidConstraintMiddleware,
                aPasswordIsGivenConstraint,
                RetrieveUserMiddleware
            ],
            
            action: ctx.controllers.core.getMethod('onLogin')
        },
        
        {
            method: 'post',
            path: '/logout',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.core.getMethod('onLogout')
        }, 

        {
            method: 'post',
            path: '/api/register',
            middlewares: [ 
                EmailIsValid,
                aPasswordIsGivenConstraint,
                PasswordIsNotTooWeakConstraint,
                ConfirmPasswordConstraint,
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
    ];
};
       