const RetrieveUserIdMiddlewareFactory = require('../src/retrieve-user-id.middleware');

module.exports = ctx => {
    const RetrieveUserIdMiddleware = RetrieveUserIdMiddlewareFactory(ctx);
    return [
        {
            method: 'get',
            path: '/api/member',
            middlewares: [
                RetrieveUserIdMiddleware
            ],
            
            action: ctx.controllers.test.getMethod('serveRouteOnlyAllowedToMember')
        },

        {
            method: 'get',
            path: '/login',
            middlewares: [],
            
            action: ctx.controllers.test.getMethod('serveLogin')
        },

        {
            method: 'get',
            path: '/',
            middlewares: [],

            action: ctx.controllers.test.getMethod('serveHome')
        },
        
    ]
};
       