const DecodeForgotPasswordTokenFactory = require('./decode-forgot-password-token.middleware');
const ConfirmPasswordConstraint = require('../../app/src/middlewares/confirmPassword.middleware');
const EmailIsValid = require('../../app/src/middlewares/emailIsValid.constraint.middleware');
const PasswordIsNotTooWeakConstraint = require('../../app/src/middlewares/passwordIsNotTooWeak.constraint.middleware');
const emailIsValidConstraintMiddleware = require('../../app/src/middlewares/emailIsValid.constraint.middleware');
const aPasswordIsGivenConstraint = require('../../app/src/middlewares/aPasswordIsGiven.constraint');


module.exports = ctx => {
    const DecodeForgotPasswordToken = DecodeForgotPasswordTokenFactory(ctx);

    return [
        {
            method: 'post',
            path: '/api/login',
            middlewares: [
                emailIsValidConstraintMiddleware,
                aPasswordIsGivenConstraint
            ],
            
            action: ctx.controllers.authenticatorController.getMethod('onLogin')
        },
        
        {
            method: 'get',
            path: '/logout',
            action: ctx.controllers.authenticatorController.getMethod('onLogout')
        }, 

        {
            method: 'post',
            path: '/api/register',
            middlewares: [ 
                EmailIsValid,
                aPasswordIsGivenConstraint,
                PasswordIsNotTooWeakConstraint,
                ConfirmPasswordConstraint
            ],
            
            action: ctx.controllers.authenticatorController.getMethod('onRegister')
        },

        {
            method:'post',
            path: '/api/forgot-password',
            middlewares: [ 
                EmailIsValid
            ],

            action: ctx.controllers.authenticatorController.getMethod('onForgotPassword')
        },

        {
            method:'post',
            path: '/api/reset-password',
            middlewares: [
                ConfirmPasswordConstraint,
                DecodeForgotPasswordToken
            ],

            action: ctx.controllers.authenticatorController.getMethod('onResetPassword')
        },
    ];
};
       