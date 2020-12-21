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
            authResponseHelper: context.api.authResponseHelper,

            userRequestAdapter: context.api.userRequestAdapter
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
        const email = this.api.userRequestAdapter.getEmail(request);
        const result = await this.services.authenticator.forgotPassword(email);

        response.json({
            message: 'done'
        });
    }

    async onResetPassword(request, response) {
        const applicationSettings =  this.services.jwt.getapplicationSettings(request);
        const forgotPasswordToken = request.body.token;
        const password = request.body.password;

        let tokenData = null;

        // check if token is valid
        try {
            tokenData = await this.services.jwt.verifyForgotPasswordToken(forgotPasswordToken, applicationSettings);
            //await this.spi.jwtPersistence.deleteToken(forgotPasswordToken);    
            await this.services.jwt.clear(request, response);
        }

        catch(err) {
            return response.sendStatus(401);
        }

        // check integrity by retrieve it from our token storage
        const storedTokenData = await this.spi.jwtPersistence.getForgotPasswordToken(forgotPasswordToken);

        if (storedTokenData === null) {
            return response.sendStatus(401);
        }

        
        // duplicate custom field added by jwt-lib
        // storedTokenData.iat = tokenData.iat;
        // storedTokenData.exp = tokenData.exp;
        delete tokenData.iat;
        delete tokenData.exp;

        // compare decoded content
        if (JSON.stringify(tokenData) !== JSON.stringify(storedTokenData)) {
            return response.sendStatus(401);
        }

        else {
            // everything seems ok, just update the password
            const user_uuid = storedTokenData.user_uuid;
            await this.spi.userPersistence.updateUserPassword(
                user_uuid, 
                sha256(password), 
                service
            );
        }
        
        return response.sendStatus(200);
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