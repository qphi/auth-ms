const BaseController = require('../../BaseController.controller');
const sha256 = require('sha256');

class AuthenthicatorAPIController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);
    }

    async generateNewAccessToken(request, response) {
        const service = request.service;
        const refresh = this.getCookie(request, service.COOKIE_JWT_REFRESH_NAME);
        
        if (refresh === null) {
            return response.sendStatus(401);
        }
    
        if (await this.services.jwt.hasRefreshToken(refresh)) {
            return response.sendStatus(403);
        }
    
        let user = null;
        
        try {
            user = this.services.jwt.verify(refresh, service.JWT_SECRET_REFRESHTOKEN);
        }

        catch (err) {
            return response.sendStatus(403);
        }

        const userData = { username: user.username,  role: user.role };
        const newAccess = this.services.jwt.sign(
            userData, 
            service.JWT_SECRET_ACCESSTOKEN, 
            service.JWT_ACCESS_TTL
        );

        this.setJWTAccess(response, service, newAccess);
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
            console.log('uuid is null');
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

        console.log(service);
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
        console.log(tokenData, storedTokenData);

        // compare decoded content
        if (JSON.stringify(tokenData) !== JSON.stringify(storedTokenData)) {
            console.log('its !==')
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

        console.log("name", name)
       
        await this.services.db.record({
            name: name,
            DB_TYPE: 'mysql'
        });

        return response.sendStatus(200);
    }
};

module.exports = AuthenthicatorAPIController;