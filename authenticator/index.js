//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const MicroService = require('../src/microservice.model');
const DBService = require('../services/db.service');

const mock = require('./authenticator.mock');

const sha256 = require('sha256');

const recordedRoutes = require('./authenticator.router');
const RoutingService = require('../services/routing.service');

console.log(RoutingService)

const JWTService = require('../services/JWTAuthoring.service');

class Authenticator extends MicroService {
    constructor(settings = {}) {
        super(settings);

        this.services = {
            db: new DBService(mock.service),
            jwt: new JWTService(settings)
        }
       
        const router = recordedRoutes({
            controllers: {
                authenticatorController: this
            }
        });

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
            typeof email !== 'string' ||
            typeof password !== 'string' ||
            typeof confirmPassword !== 'string'
        ) {
            return response.sendStatus(401);
        }

        if (password !== confirmPassword) {
            return response.send('Password mismatch');
        }

        await this.services.db.createUser({
            email: sha256(email), 
            password: sha256(password),
            role: 'member' 
        }, request.service);

        response.sendStatus(200);
    }
}

const path = require('path');
const routingService = require('../services/routing.service');

const server = new Authenticator({
    env: path.resolve(__dirname, './.env')
});

server.start();