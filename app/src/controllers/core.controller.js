const { BaseController } = require('micro');
const sha256 = require('sha256');
const crypto = require('crypto');
const uuid = require('uuid');

const MissingRefreshTokenException = require('../Exceptions/MissingRefreshToken.exception');
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError');
const UserPersistenceInterface = require('../SPI/User/UserPersistence.interface');
const JWTPersistenceInterface = require('../SPI/JWT/JWTPersistence.interface');

const STATUS_CODE = require('../../config/status-code.config');

const { params } = require('../dev.application-state');
const ApplicationNameIsNotAvailableException = require('../Exceptions/ApplicationNameIsNotAvailable.exception');
const { PROCESS_ABORTED } = require('../../config/status-code.config');

class CoreController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);

        this.api = {
            requestAdapter: settings.api.requestAdapter || require('../API/request.helper'),
            /** @type {ResponseHelper} */
            responseHelper: settings.api.responseAdapter,
            /** @type {UserRequestHelper} */
            userRequestAdapter: settings.api.userRequestAdapter
        };

        this.spi = {
            /** @type {JWTPersistenceInterface} */
            jwtPersistence: settings.spi.jwtPersistence,
            /** @type {UserPersistenceInterface} */
            userPersistence: settings.spi.userPersistence,
            /** @type {CustomerApplicationPersistenceInterface} */
            customerApplicationPersistence: settings.spi.customerApplicationPersistence,

            userNotification:  settings.spi.userNotification,
        }

        this.services.jwt = settings.services.jwt;
    }

    
    /**
     * Forge an identity token. A valid refresh token must be providen
     * @param {Request} request 
     * @param {Response} response 
     */
    async generateIdentityToken(request, response) {
        try {
            const identityToken = this.api.requestAdapter.getIdentityToken(request);
            const identityTokenSecret = request.applicationSettings.JWT_SECRET_ACCESSTOKEN;
            const identityPayload = await this.services.jwt.verify(identityToken, identityTokenSecret, {
                ignoreExpiration: true,
                ignorePreventExpiration: true
            });
            
            const nowInSeconds = Math.ceil(Date.now() / 1000);
            
            if (identityPayload.expire > nowInSeconds) {
                throw new InvalidTokenException('This token is not expired !');
            }
            

            const refreshToken = await this.services.jwt.getRefreshToken(request);
            const refreshTokenSecret = this.api.requestAdapter.getRefreshTokenSecret(request);
            const refreshPayload = await this.services.jwt.verify(refreshToken, refreshTokenSecret);
            
            if (
                (
                    typeof identityPayload.user_id === 'string' &&
                    identityPayload.user_id.length > 10 &&
                    identityPayload.user_id === refreshPayload.user_id &&
                    typeof identityPayload.salt === 'string' &&
                    identityPayload.salt === refreshPayload.salt
                ) !== true 
            ) {
                throw new InvalidTokenException('try to refresh with an incorrect identity');
            }
            
            const userData = { 
                user_id: refreshPayload.user_id,
                salt: refreshPayload.salt
            };

            const applicationSettings = this.services.jwt.getApplicationSettings(request);
            const newIdentityToken = this.services.jwt.forgeIdentityToken(userData, applicationSettings);
    
            this.api.responseHelper.addIdentityToken(
                response, 
                applicationSettings,
                newIdentityToken
            );

            return response.status(200).json({
                status: STATUS_CODE.PROCESS_DONE,
                error: STATUS_CODE.NO_ERROR,
                message: STATUS_CODE.LOGIN_SUCCESSFUL
            });
        }   
        
        catch(error) {
            console.error(error);
            if (error instanceof MissingRefreshTokenException) {
                return response.status(401).json({
                    error: STATUS_CODE.WITH_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED,
                    message: 'MissingRefreshTokenException'
                });
            }

            else if (
                error instanceof InvalidTokenException ||
                error instanceof JsonWebTokenError
            ) {
                return response.status(403).json({
                    error: STATUS_CODE.WITH_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED,
                    message: 'Invalid token'
                });
            }

            else {
                return response.status(500).json({
                    error: STATUS_CODE.WITH_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED,
                    message: error.message
                });
            }
        }
    }

    async onLogout(request, response) {
        try {
            await this.services.jwt.clear(request, response);
            response.send("Logout successful");
        }

        catch(error) {
            response.sendStatus(500);
        }
       
    }

    async onLogin(request, response) {
        const applicationSettings = this.services.jwt.getApplicationSettings(request);
        // Read username and password from request body
        const email = this.api.userRequestAdapter.getEmail(request);
        const password = this.api.userRequestAdapter.getPassword(request);

       const user = await this.spi.userPersistence.findByCredentials(
            email, 
            password, 
            applicationSettings
        );
 
        // Filter user from the users array by username and password
        //const user = mock.users.find(u => { return u.username === username && u.password === password });
    
        if (user !== null) {
            // Generate an access token
            const userData = { user_id: user._id };
            
            const {identityToken, refreshToken} = this.services.jwt.forgeToken(userData, applicationSettings);
            
            this.spi.jwtPersistence.storeRefreshToken(refreshToken);

            this.api.responseHelper.addIdentityToken(response, applicationSettings, identityToken, false);
            this.api.responseHelper.addRefreshToken(response, applicationSettings, refreshToken, false);

            return response.status(200).send({
                message: STATUS_CODE.LOGIN_SUCCESSFUL,
                error: STATUS_CODE.NO_ERROR,
                status: STATUS_CODE.PROCESS_DONE
            });
        } 
        
        else {
            // We dont now anything about user context. Clear bad JWT cookies if founds
            await this.services.jwt.clear(request, response);

            response.status(401).send({
                message: STATUS_CODE.BAD_CREDENTIALS,
                error: STATUS_CODE.NO_ERROR,
                status: STATUS_CODE.PROCESS_DONE
            });
        }
    }

    async onRegister(request, response) {
        const email = this.api.userRequestAdapter.getEmail(request);
        const password = this.api.userRequestAdapter.getPassword(request);
        const confirmPassword = this.api.userRequestAdapter.getConfirmPassword(request);

        if (
            typeof confirmPassword !== 'string'
        ) {
            return response.sendStatus(401);
        }

        if (password !== confirmPassword) {
            return response.send('Password mismatch');
        }

        const responseMessage = {}
        let status = 201;

        try {
            const applicationSettings =  this.services.jwt.getApplicationSettings(request);
            const userData = {
                email: email, 
                password: password,
                role: 'member' 
            };

            responseMessage.user_id = await this.spi.userPersistence.create(
                userData, 
                applicationSettings
            );


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
        const email = request.body.email;
        const applicationSettings =  this.services.jwt.getApplicationSettings(request);

        const uuid = await this.spi.userPersistence.getUserUUID(
            sha256(email), 
            applicationSettings
        );

        if (uuid === null) {
            return response.sendStatus(200);
        }

        const now = Math.ceil(Date.now() / 1000); // in seconds;
        const forgotPasswordTTL = params.forgotPasswordTokenTTL;
        const expire = now + forgotPasswordTTL;

        const idempotency_key =  sha256(applicationSettings.MS_UUID + email);
        const data = {
            user_uuid: uuid, 
            service_uuid: applicationSettings.MS_UUID,
            created_at: now, 
            expire_at: expire,
            target: idempotency_key
        };

        try {
            const forgotPasswordToken = this.services.jwt.forgeForgotPasswordToken(data, applicationSettings);
            await this.spi.jwtPersistence.storeForgotPasswordToken(forgotPasswordToken, data);

            this.spi.jwtPersistence.remove({
                target: idempotency_key,
                token: token => token !== forgotPasswordToken
            });

            this.spi.userNotification.notifyForgotPassword(email, forgotPasswordToken, applicationSettings);


            response.json({
                error: STATUS_CODE.NO_ERROR,
                status: STATUS_CODE.PROCESS_DONE,
                message: STATUS_CODE.PROCESS_DONE
            });
        }

        catch (error) {
            console.error(error);
            response.sendStatus(500);
        }
    }

    async onResetPassword(request, response) {
        const applicationSettings =  this.services.jwt.getApplicationSettings(request);
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

module.exports = CoreController;