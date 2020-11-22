const { Singleton } = require('micro');

/**
 * @class UserRequestHelper
 */
class UserRequestHelper {
    getEmail(request) {
        return request.user.email;
    }

    getPassword(request) {
        return request.user.password;
    }
}

module.exports = /** @type {UserRequestHelper} */ Singleton.create(UserRequestHelper);

