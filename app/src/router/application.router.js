const RetrieveServiceMiddlewareFactory = require('../middlewares/retrieveService.middleware');
const RetrieveUserMiddleware = require('../middlewares/retrieveUser.middleware');
const isGranted = require('../middlewares/isGranted.middleware');
const CheckHTTPSignatureFactory = require('../middlewares/checkHTTPSignature.middleware');
const { ResourceRouter } = require('rest-api');

/**
 * @param {Object} ctx
 * @return {Array<{method: string, path: string, middlewares: Function[], action: Function}>}
 */
module.exports = ctx => {
    const RetrieveServiceMiddleware = RetrieveServiceMiddlewareFactory(ctx);
    const checkHTTPSignature = CheckHTTPSignatureFactory(ctx);
    const controller = ctx.controllers.application;

    const crudRoutes = ResourceRouter('application', ctx).filter(
        route => !(route.path === '/application' && route.method === 'get')
    );

    // sanitize them and override parameter name for controller
    crudRoutes.forEach(route => {
        route.path = route.path.replace(':_id', ':ms_id');

        if (!Array.isArray(route.middlewares)) {
            route.middlewares = [];
        }

        if (route.path === '/application' && route.method === 'post') {
            // @todo add security
        }

        else {
            route.middlewares.push(
                RetrieveServiceMiddleware,
                checkHTTPSignature,
                isGranted
            );
        }

        route.path = `/api${route.path}`;
    });


    return (
        /** @type {Array<{method: string, path: string, middlewares: Function[], action: Function}>} **/
        crudRoutes.concat([
            {
                method: 'put',
                path: '/api/application/:ms_id/enable',
                middlewares: [
                    RetrieveServiceMiddleware,
                    checkHTTPSignature,
                    isGranted
                ],

                action: controller.getMethod('enableById')
            },

            {
                method: 'put',
                path: '/api/application/:ms_id/public_key',
                middlewares: [RetrieveServiceMiddleware, isGranted],

                action: controller.getMethod('setPublicKey')
            },

            {
                method: 'put',
                path: '/api/application/:ms_id/disable',
                middlewares: [RetrieveServiceMiddleware, checkHTTPSignature, isGranted],

                action: controller.getMethod('disableById')
            },

            {
                method: 'get',
                path: '/api/application',
                middlewares: [RetrieveServiceMiddleware, isGranted, checkHTTPSignature],

                action: controller.getMethod('findByAPIKey')
            }
        ])
    );
}