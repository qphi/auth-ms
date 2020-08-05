//@see https://stackabuse.com/authentication-and-authorization-with-jwts-in-express-js/
// https://medium.com/the-node-js-collection/making-your-node-js-work-everywhere-with-environment-variables-2da8cdf6e786
const MicroService = require('../src/microservice.model');
const DBService = require('../services/db.service');

const RetrieveServiceMiddleware = require('./retrieveService.middleware');
const RetrieveUserMiddleware = require('./retrieveUser.middleware');

const mock = require('./authenticator.mock');

const jwt = require('jsonwebtoken');
const redis = require('redis');

const day_in_ms = 864000000;
// const mariadb = require('mariadb');
// const sha256 = require('sha256');

class AuthenticatorService extends MicroService {
    constructor(settings = {}) {
        super(settings);

        this.app.post(
            '/login', 

            [
                RetrieveServiceMiddleware,
                RetrieveUserMiddleware
            ],
            
            this.onLogin.bind(this)
        );
        
        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        this.app.post(
            '/logout', 
            RetrieveServiceMiddleware, 
            this.onLogout.bind(this)
        );
        
        this.app.get(
            '/token', 
            RetrieveServiceMiddleware, 
            this.generateNewAccessToken.bind(this)
        );

        this.redis = redis.createClient({
           port: settings.REDIS_PORT || process.env.REDIS_PORT, 
           host: settings.REDIS_HOST || process.env.REDIS_HOST, 
           password: settings.REDIS_PASSWORD || process.env.REDIS_PASSWORD 
        });

        this.dbService = new DBService(mock.service);
    }

    hasRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.get(refreshToken, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(value === '1');
                }
            });
        });
    }

    storeRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.set(refreshToken, '1', 'PX', day_in_ms, (err, value) => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve(value === '1');
                }
            });
        });
    }

    deleteRefreshToken(refreshToken) {
        return new Promise((resolve, reject) => {
            this.redis.del(refreshToken, err => {
                if (err) {
                    reject(err);
                }

                else {
                    resolve();
                }
            });
        });
    }

    async generateNewAccessToken(request, response) {
        const service = request.service;
        const refresh = this.getCookie(request, service.COOKIE_JWT_REFRESH_NAME);
        
        if (refresh === null) {
            return response.sendStatus(401);
        }
    
        if (await this.hasRefreshToken(refresh)) {
            return response.sendStatus(403);
        }
    
        jwt.verify(refresh, service.JWT_SECRET_REFRESHTOKEN, (err, user) => {
            if (err) {
                return response.sendStatus(403);
            }
    
            const userData = { username: user.username,  role: user.role };
            const newAccess = jwt.sign(userData, service.JWT_SECRET_ACCESSTOKEN,         
                { 
                    expiresIn: service.JWT_ACCESS_TTL + 'ms' 
                }
            );
    
            this.setJWTAccess(response, service, newAccess);
        });
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

        if (send === true) {
            response.sendStatus(200);
        }
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

    async clearJWT(request, response) {
        const service = request.service;
        const access = this.getCookie(request, service.COOKIE_JWT_REFRESH_NAME);
        if (access !== null) {
            await this.deleteRefreshToken(access);    
        }

        response.clearCookie(service.COOKIE_JWT_ACCESS_NAME);
        response.clearCookie(service.COOKIE_JWT_REFRESH_NAME);
    }

    async onLogout(request, response) {
        await this.clearJWT(request, response);
        response.send("Logout successful");
    }



    async onLogin(request, response) {
        const service = request.service;
        // Read username and password from request body
        const { email, password } = request.user;
        const user = await this.dbService.findUser(email, password, service);
    
        // Filter user from the users array by username and password
        //const user = mock.users.find(u => { return u.username === username && u.password === password });
    
        if (user !== null) {
            // Generate an access token
            const userData = { username: user.username,  role: user.role };
            const accessToken = jwt.sign(userData, service.JWT_SECRET_ACCESSTOKEN, {
                expiresIn: service.JWT_ACCESS_TTL + 'ms'
            });

            const refreshToken = jwt.sign(userData, service.JWT_SECRET_REFRESHTOKEN);

            this.storeRefreshToken(refreshToken);
        
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
}

const path = require('path');

const server = new AuthenticatorService({
    env: path.resolve(__dirname, './.env')
});

server.start();