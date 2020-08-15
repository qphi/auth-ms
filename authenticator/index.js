//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const MicroService = require('../src/microservice.model');
const DBService = require('../services/db.service');

const mock = require('./authenticator.mock');

const sha256 = require('sha256');
const nodemailer = require('nodemailer');

const recordedRoutes = require('./authenticator.router');
const RoutingService = require('../services/routing.service');

const _6hours = 21600000;

const JWTService = require('../services/JWTAuthoring.service');


class Authenticator extends MicroService {
    constructor(settings = {}) {
        super(settings);

        this.services = {
            db: new DBService(mock.service),
            jwt: new JWTService(settings),
            mailer: nodemailer.createTransport({
                host: 'smtp.mailtrap.io',
                port: 2525,
                auth: {
                   user: process.env.MAILTRAP_USER_ID,
                   pass: process.env.MAILTRAP_PASSWORD
                }
            })
        };


        console.log({
            host: 'smtp.mailtrap.io',
            port: 2525,
            auth: {
               user: process.env.MAILTRAP_USER_ID,
               pass: process.env.MAILTRAP_PASSWORD
            }
        })

        const router = recordedRoutes({
            controllers: {
                authenticatorController: this
            }
        });

        this.app.set('views', settings.views_path);
        this.app.set('view engine', 'ejs');

        RoutingService.use(this.app, router);
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
            await this.services.jwt.deleteRefreshToken(access);    
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
                to reset your password please follow this link : http://localhost:8626/reset-password-form?token=${token}
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

    renderForgetPassword(request, response) {
        const service = request.service;


        response.render('forgot-password', {
            service_name: service.name,
            service_img: service.ICON_SRC
        });
    }

    async onResetPassword(request, response) {
        const service = request.service;
        const token = request.body.token;
        const password = request.body.password;

        let tokenData = null;

        // check if token is valid
        try {
            tokenData = await this.services.jwt.verify(token, service.JWT_SECRET_FORGOTPASSWORDTOKEN);
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
}

const path = require('path');
const server = new Authenticator({
    env: path.resolve(__dirname, './.env'),
    views_path: path.resolve(__dirname, '../views')
});

server.start();