const { BaseController } = require('micro');
const sha256 = require('sha256');
const crypto = require('crypto');
const uuid = require('uuid');

const MissingRefreshTokenException = require('../Exceptions/MissingRefreshToken.exception');
const InvalidTokenException = require('../Exceptions/InvalidToken.exception');
const JsonWebTokenError = require('jsonwebtoken/lib/JsonWebTokenError');


class AuthenthicatorAPIController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);

        this.api = {
            requestAdapter: settings.requestAdapter || require('../API/request.helper')
        };

        this.spi = {
            jwtPeristence: settings.jwtPeristence || require('../SPI/RedisJWTPersistance.service')
        }

        this.services.jwt = settings.services.jwt;
    }

    
    async generateIdentityToken(request, response) {
        try {
            const refreshToken = await this.services.jwt.getRefreshToken(request);
            const refreshTokenSecret = this.api.requestAdapter.getRefreshTokenSecret(request);
            const user = this.services.jwt.verify(refreshToken, refreshTokenSecret);
            const userData = { username: user._id,  role: user.role };

            const clientSettings = this.services.jwt.getClientSettings(request);

            const identityToken = this.services.jwt.sign(
                userData, 
                clientSettings.JWT_SECRET_ACCESSTOKEN, 
                clientSettings.JWT_ACCESS_TTL
            );
    
            this.setJWTAccess(response, clientSettings, identityToken);
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


    async clearJWT(request, response) {
        const service = request.service;
        const access = this.getCookie(request, service.COOKIE_JWT_REFRESH_NAME);
        if (access !== null) {
            await this.services.jwt.deleteToken(access);    
        }

        response.clearCookie(service.COOKIE_JWT_ACCESS_NAME);
        response.clearCookie(service.COOKIE_JWT_REFRESH_NAME);
    }

    setJWTAccess(response, service, access, send = true) {
        response.cookie(
            service.COOKIE_JWT_ACCESS_NAME, 
            access, 
            { 
                httpOnly: true, 
                maxAge: service.JWT_ACCESS_TTL
            }
        );
    }

    setJWTRefresh(response, service, refresh, send = true) {
        response.cookie(
            service.COOKIE_JWT_REFRESH_NAME, 
            refresh, 
            { 
                httpOnly: true, 
                maxAge: 86400000 // 1 day
            }
        );

        if (send === true) {
            response.sendStatus(200);
        }
    }

    async onLogout(request, response) {
        await this.clearJWT(request, response);
        response.send("Logout successful");
    }



    async onLogin(request, response) {
        const service = request.service;
        // Read username and password from request body
        const { email, password } = request.user;
        const user = await this.services.db.findUser(email, password, service);
    
        // Filter user from the users array by username and password
        //const user = mock.users.find(u => { return u.username === username && u.password === password });
    
        if (user !== null) {
            // Generate an access token
            const userData = { username: user.username,  role: user.role };
            const accessToken = this.services.jwt.sign(
                userData, 
                service.JWT_SECRET_ACCESSTOKEN,
                service.JWT_ACCESS_TTL
            );

            const refreshToken = this.services.jwt.sign(
                userData, 
                service.JWT_SECRET_REFRESHTOKEN
            );

            this.services.jwt.storeRefreshToken(refreshToken);
        
            this.setJWTAccess(response, service, accessToken, false);
            this.setJWTRefresh(response, service, refreshToken);
            return;
        } 
        
        else {
            // We dont now anything about user context. Clear bad JWT cookies if founds
            await this.clearJWT(request, response);

            response.send('Username or password incorrect');
        }
    }

    async onRegister(request, response) {
        const { email, password, confirmPassword } = request.body;

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
            responseMessage.user_id = await this.services.db.createUser({
                email: sha256(email), 
                password: sha256(password),
                role: 'member' 
            }, request.service);


            if (responseMessage.user_id !== null) {
                responseMessage.status = 'done';
            }
        }

        catch (error) {
            console.error(error);
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
        const email = request.body.email;
        const service = request.service;

        const uuid = await this.services.db.getUserUUID(sha256(email), service);

        if (uuid === null) {
            return response.sendStatus(200);
        }

        const now = Date.now();
        const expire = now + _6hours;

        const data = {
            user_uuid: uuid, 
            service_uuid: service.MS_UUID, 
            created_at: now, 
            expire_at: expire
        };

        const token = this.services.jwt.sign(
            data,
            service.JWT_SECRET_FORGOTPASSWORDTOKEN,
            _6hours
        );

        await this.services.jwt.storeForgotPasswordToken(token, data);


        this.services.mailer.sendMail({
            from: 'authenticator-service@tesla.com', // Sender address
            to: email,         // List of recipients
            subject: 'Forgot Password', // Subject line
            text: `
                to reset your password please follow this link : ${this.getResetPasswordURL(service)}?token=${token}
            ` // Plain text body
        }, 
        
        (err, info) => {
            if (err) {
              console.log(err)
            } else {
              console.log(info);
            }
        });
        console.log(token);

        response.json(token);
    }

    async onResetPassword(request, response) {
        const service = request.service;
        const token = request.body.token;
        const password = request.body.password;

        let tokenData = null;

        // check if token is valid
        try {
            tokenData = await this.services.jwt.verify(token, service.JWT_SECRET_FORGOTPASSWORDTOKEN);
            await this.services.jwt.deleteToken(token);
            await this.clearJWT();
        }

        catch(err) {
            return response.sendStatus(401);
        }

        // check integrity by retrieve it from our token storage
        const storedTokenData = await this.services.jwt.getForgotPasswordToken(token);

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
            await this.services.db.updateUserPassword(user_uuid, sha256(password), service);
        }
        
        return response.sendStatus(200);
    }

    getResetPasswordURL(service) {
        if (service.FORGOT_PASSWORD_URL) {
            return service.FORGOT_PASSWORD_URL;
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
            COOKIE_JWT_ACCESS_NAME: sha256(`jwt-${name}-access-cookie-${SALT}`), 
            COOKIE_JWT_REFRESH_NAME: sha256(`jwt-${name}-refresh-cookie-${SALT}`),
            SALT
        }

        
        await this.services.db.record(settings);

        return response.sendStatus(200);
    }
};

module.exports = AuthenthicatorAPIController;