const { BaseController } = require('micro');

const STATUS_CODE = require('../../app/config/status-code.config');

class TestController extends BaseController {
    constructor(context = {}) {
        super(context);
    }

    serveLogin(request, response) {
        response.json({
            message: '/login'
        });
    }

    serveRouteOnlyAllowedToMember(request, response) {
        if (request.user_id) {
            return response.json({
                message: {
                    user_id: request.user_id
                }
            });
        }

        else {
            return request.send('403');
        }
    }
}

module.exports = TestController;