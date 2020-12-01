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

const { param } = require('../dev.application-state');

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
            jwtPeristence: settings.spi.jwtPeristence,
            /** @type {UserPersistenceInterface} */
            userPersistence: settings.spi.userPersistence,
            /** @type {CustomerApplicationPersistenceInterface} */
            customerApplicationPersistence: settings.spi.customerApplicationPersistence
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
            const refreshToken = await this.services.jwt.getRefreshToken(request);
            const refreshTokenSecret = this.api.requestAdapter.getRefreshTokenSecret(request);
            const user = this.services.jwt.verify(refreshToken, refreshTokenSecret);
            const userData = { username: user._id,  role: user.role };

            const clientSettings = this.services.jwt.getClientSettings(request);

            const identityToken = this.services.jwt.forgeIdentityToken(userData, clientSettings);
    
            this.api.responseHelper.addIdentityToken(
                response, 
                clientSettings, 
                identityToken
            );

            return response.sendStatus(200);
        }   
        
        catch(error) {
            if (error instanceof MissingRefreshTokenException) {
                return response.sendStatus(401);
            }

            else if (
                error instanceof InvalidTokenException ||
                error instanceof JsonWebTokenError
            ) {
                return response.sendStatus(403);
            }

            else {
                return response.sendStatus(500);
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
        const clientSettings = this.services.jwt.getClientSettings(request);
        // Read username and password from request body
        const email = this.api.userRequestAdapter.getEmail(request);
        const password = this.api.userRequestAdapter.getPassword(request);
       const user = await this.spi.userPersistence.findByCredentials(
            email, 
            password, 
            clientSettings
        );
    
        // Filter user from the users array by username and password
        //const user = mock.users.find(u => { return u.username === username && u.password === password });
    
        if (user !== null) {
            // Generate an access token
            const userData = { username: user.username,  role: user.role };
            
            const {identityToken, refreshToken} = this.services.jwt.forgeToken(userData, clientSettings);
            
            this.spi.jwtPeristence.storeRefreshToken(refreshToken);

            this.api.responseHelper.addIdentityToken(response, clientSettings, identityToken, false);
            this.api.responseHelper.addRefreshToken(response, clientSettings, refreshToken, false);

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

        try {
            const clientSettings =  this.services.jwt.getClientSettings(request);
            const userData = {
                email: email, 
                password: password,
                role: 'member' 
            };

            responseMessage.user_id = await this.spi.userPersistence.create(
                userData, 
                clientSettings
            );


            if (responseMessage.user_id !== null) {
                responseMessage.status = 'done';
            }
        }

        catch (error) {
            if (error.name === 'UserAlreadyExistsException') {
                responseMessage.message = 'An account using this email was found';
            }

            else {
                responseMessage.message = error.message;
            }

            responseMessage.status = 'aborted';
        }

        finally {
            response.json(responseMessage);
        }
    }

    async onForgotPassword(request, response) {
        const email = this.api.userRequestAdapter.getEmail(request);
        const clientSettings =  this.services.jwt.getClientSettings(request);

        const uuid = await this.spi.userPersistence.getUserUUID(
            sha256(email), 
            clientSettings
        );

        if (uuid === null) {
            return response.sendStatus(200);
        }

        const now = Date.now();
        const forgotPasswordTTL = param.forgotPasswordTokenTTL;
        const expire = now + forgotPasswordTTL;

        const data = {
            user_uuid: uuid, 
            service_uuid: clientSettings.MS_UUID, 
            created_at: now, 
            expire_at: expire
        };

        const forgotPasswordToken = this.services.jwt.forgotPasswordToken(data);

        await this.services.jwt.storeForgotPasswordToken(forgotPasswordToken, data);


        // emit event => SQS ?
        // this.services.mailer.sendMail({
        //     from: 'authenticator-service@tesla.com', // Sender address
        //     to: email,         // List of recipients
        //     subject: 'Forgot Password', // Subject line
        //     text: `
        //         to reset your password please follow this link : ${this.getResetPasswordURL(service)}?token=${token}
        //     ` // Plain text body
        // }, 
        
        // (err, info) => {
        //     if (err) {
        //       console.log(err)
        //     } else {
        //       console.log(info);
        //     }
        // });

        console.log('forgotPasswordToken', forgotPasswordToken);

        response.json(forgotPasswordToken);
    }

    async onResetPassword(request, response) {
        const clientSettings =  this.services.jwt.getClientSettings(request);
        const forgotPasswordToken = request.body.token;
        const password = request.body.password;

        let tokenData = null;

        // check if token is valid
        try {
            tokenData = await this.services.jwt.verifyForgotPasswordToken(forgotPasswordToken, clientSettings);
            //await this.spi.jwtPeristence.deleteToken(forgotPasswordToken);    
            await this.services.jwt.clear(request, response);
        }

        catch(err) {
            return response.sendStatus(401);
        }

        // check integrity by retrieve it from our token storage
        const storedTokenData = await this.spi.jwtPeristence.getForgotPasswordToken(forgotPasswordToken);

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

    getResetPasswordURL(clientSettings) {
        if (clientSettings.FORGOT_PASSWORD_URL) {
            return clientSettings.FORGOT_PASSWORD_URL;
        }

        else {
            return process.env.FORGOT_PASSWORD_URL;
        }
    }

    async onCreateService(request, response) {
        const name = request.body.name;

       
        const SALT = crypto.randomBytes(16);
        const settings = {
            DB_TYPE: 'mysql',
            name: name,
            icon_src: '',

            JWT_ACCESS_TTL: 180000,
            JWT_SECRET_ACCESSTOKEN: sha256(`jwt-${name}-access-token-${SALT}`), 
            JWT_SECRET_REFRESHTOKEN: sha256(`jwt-${name}-refresh-token-${SALT}`), 
            JWT_SECRET_FORGOTPASSWORDTOKEN: sha256(`jwt-${name}-forgotpassword-token-${SALT}`), 
            MS_UUID: uuid.v5(name, process.env.MS_UUID),
            API_KEY:  uuid.v5(name + SALT, process.env.MS_UUID),
            COOKIE_JWT_ACCESS_NAME: sha256(`jwt-${name}-access-cookie-${SALT}`), 
            COOKIE_JWT_REFRESH_NAME: sha256(`jwt-${name}-refresh-cookie-${SALT}`),
            SALT
        }
        
        console.log('settings', settings);
        await this.spi.customerApplicationPersistence.create(settings);

        return response.sendStatus(200);
    }
};

module.exports = CoreController;