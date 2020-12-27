const { BaseController } = require('micro');

const STATUS_CODE = require('../../app/config/status-code.config');
const AuthRequestHelper = require('./request.helper');

/**
 * @typedef Response
 * @extends ServerResponse
 * @method redirect
 */

class AuthenticatorMicroServiceController extends BaseController {
    /**
     * @param {Object} context 
     * @param {Object} context.services 
     * @param {AuthSPIService} context.services.authService
     * @param {Object} context.api
     * @param {AuthRequestHelper} context.api.authRequestHelper
     * @param {AuthResponseHelper} context.api.authResponseHelper
     */
    constructor(context = {}) {
        super(context);

       
        this.api = {
            /** @type {AuthRequestHelper} */
            authRequestHelper: context.api.authRequestHelper,

            /** @type {AuthResponseHelper} */
            authResponseHelper: context.api.authResponseHelper
        };

        this.services = {
            /** @type {AuthSPIService} */
            authenticator: context.services.authService
        };
    }

    async onLogout(request, response) {
        try {
            await this.api.authResponseHelper.clearCredentials(response);
            response.redirect('/');
        }

        catch(error) {
            console.error(error);
            response.status(500).end();
        }
    }

    async onLogin(request, response) {
        const email = this.api.authRequestHelper.getEmail(request);
        const password = this.api.authRequestHelper.getPassword(request);

        /**
         * @type {{identityToken : string, refreshToken: string, success: boolean}}
         */
        const result = await this.services.authenticator.login({
            email, 
            password,
        });

        if (result.success === true) {
            this.api.authResponseHelper.addIdentityToken(response, result.identityToken);
            this.api.authResponseHelper.addRefreshToken(response, result.refreshToken);
            return response.status(200).send({
                message: STATUS_CODE.LOGIN_SUCCESSFUL,
                error: STATUS_CODE.NO_ERROR,
                status: STATUS_CODE.PROCESS_DONE
            });
        }
        
        else {
            // We dont now anything about user context. Clear bad JWT cookies if founds
            await this.api.authResponseHelper.clearCredentials(response);

            response.status(401).send({
                message: STATUS_CODE.BAD_CREDENTIALS,
                error: STATUS_CODE.NO_ERROR,
                status: STATUS_CODE.PROCESS_DONE
            });
        }
    }

    async onRegister(request, response) {
        const email = this.api.authRequestHelper.getEmail(request);
        const password = this.api.authRequestHelper.getPassword(request);
        const confirmPassword = this.api.authRequestHelper.getConfirmPassword(request);

        let responseMessage = {}
        let status = 201;

        try {

            /**
             * @type {{ message: Object }}
             */
            const result = await this.services.authenticator.register({
                email, 
                password,
                confirmPassword
            });

            responseMessage = result.message;
            if (responseMessage.user_id !== null) {
                responseMessage.status = 'done';
            }
        }

        catch (error) {
            if (error.name === 'UserAlreadyExistsException') {
                status = 200;
                responseMessage.message = 'An account using this email was found';
            }

            else {
                status = 500;
                responseMessage.message = error.message;
            }

            responseMessage.status = 'aborted';
        }

        finally {
            response.status(status).json(responseMessage);
        }
    }

    async onForgotPassword(request, response) {
        const email = this.api.authRequestHelper.getEmail(request);
        const result = await this.services.authenticator.forgotPassword(email);

        response.json({
            message: 'done'
        });
    }

    async onResetPassword(request, response) {
        const payload = request.tokenPayload;
        const password = request.body.password;
        const confirmPassword = request.body.confirmPassword;

        const result = await this.services.authenticator.resetPassword({
            target: payload.target,
            created_at: payload.created_at,
            password,
            confirmPassword
        });

        return response.status(result.status).json(result.data);
    }

    getResetPasswordURL(applicationSettings) {
        if (applicationSettings.FORGOT_PASSWORD_URL) {
            return applicationSettings.FORGOT_PASSWORD_URL;
        }

        else {
            return process.env.FORGOT_PASSWORD_URL;
        }
    }
};

module.exports = AuthenticatorMicroServiceController;