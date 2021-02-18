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
        throw new AbstractMethodNotImplementedException();
    }

    /**
     * @param {string} refreshToken 
     */
    storeRefreshToken(refreshToken = '') {
        throw new AbstractMethodNotImplementedException();
    }

    storeForgotPasswordToken(token, data) {
        throw new AbstractMethodNotImplementedException();
    }

    getForgotPasswordToken(token) {
        throw new AbstractMethodNotImplementedException();
    }

    deleteToken(refreshToken) {
        throw new AbstractMethodNotImplementedException();
    }
}

module.exports = JWTPersistenceInterface;