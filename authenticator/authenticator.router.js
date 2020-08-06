

const RetrieveServiceMiddleware = require('./retrieveService.middleware');
const RetrieveUserMiddleware = require('./retrieveUser.middleware');

module.exports = ctx => {
    return [
        {
            method: 'post',
            path: '/login',
            middlewares: [
                RetrieveServiceMiddleware,
                RetrieveUserMiddleware

            ],
            
            action: ctx.controllers.authenticatorController.getMethod('onLogin')
        },
        
        // https://stackoverflow.com/questions/3521290/logout-get-or-post#:~:text=The%20post%20should%20be%20used,page%20with%20a%20logout%20GET).
        // https://softwareengineering.stackexchange.com/questions/196871/what-http-verb-should-the-route-to-log-out-of-your-web-app-be
        {
            method: 'post',
            path: '/logout',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.authenticatorController.getMethod('onLogout')
        }, 

        {
            method:'get',
            path: 'token',
            middlewares: [ RetrieveServiceMiddleware ],
            action: ctx.controllers.authenticatorController.getMethod('generateNewAccessToken')
        }
    ]
}