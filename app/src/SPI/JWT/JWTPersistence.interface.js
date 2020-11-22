const { 
    AbstractMethodNotImplementedException,
    InstantiateAbstractOrInterfaceException
} = require('micro'); 

/**
 * @interface JWTPersistenceInterface
 */
class JWTPersistenceInterface {
    constructor() {
        throw new InstantiateAbstractOrInterfaceException(this.constructor.name);
    }

    /**
     * @param {string} refreshToken 
     */
    hasRefreshToken(refreshToken = '') {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    /**
     * @param {string} refreshToken 
     */
    storeRefreshToken(refreshToken = '') {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    storeForgotPasswordToken(token, data) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    getForgotPasswordToken(token) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    deleteToken(refreshToken) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }
}

module.exports = JWTPersistenceInterface;