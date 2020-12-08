const { BaseController } = require('micro');


const MissingRefreshTokenException = require('../Exceptions/MissingRefreshToken.exception');
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');

const STATUS_CODE = require('../../config/status-code.config');

class AuthenticatorMicroServiceController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);

        this.api_key = process.env.AUTH_MS_API_KEY;
        this.api = {
            authResquestHelper: settings.api.authResquestHelper
        //     requestAdapter: settings.api.requestAdapter || require('../API/request.helper'),
        //     /** @type {ResponseHelper} */
        //     responseHelper: settings.api.responseAdapter,
        //     /** @type {UserRequestHelper} */
        //     userRequestAdapter: settings.api.userRequestAdapter
        };

        // this.spi = {
        //     /** @type {JWTPersistenceInterface} */
        //     jwtPersistence: settings.spi.jwtPersistence,
        //     /** @type {UserPersistenceInterface} */
        //     userPersistence: settings.spi.userPersistence,
        //     /** @type {CustomerApplicationPersistenceInterface} */
        //     customerApplicationPersistence: settings.spi.customerApplicationPersistence
        // }

        // this.services.jwt = settings.services.jwt;
    }

    async onLogout(request, response) {
        try {
            await this.api.authResquestHelper.clearCredentials(request, response);
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
            
            this.spi.jwtPersistence.storeRefreshToken(refreshToken);

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
        let status = 201;

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

    getResetPasswordURL(clientSettings) {
        if (clientSettings.FORGOT_PASSWORD_URL) {
            return clientSettings.FORGOT_PASSWORD_URL;
        }

        else {
            return process.env.FORGOT_PASSWORD_URL;
        }
    }
};

module.exports = CoreController;