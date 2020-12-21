const { 
    AbstractMethodNotImplementedException,
    InstantiateAbstractOrInterfaceException
} = require('micro'); 

/**
 * @interface UserPersistenceInterface
 */
class UserPersistenceInterface {
    constructor() {
        throw new InstantiateAbstractOrInterfaceException(this.constructor.name);
    }

    async findByCredentials(email, password, service) {
        throw new AbstractMethodNotImplementedException();
    }

    /**
     * @param email
     * @param service
     * @returns {string | null}
     */
    async getUserUUID(email, service) {
        throw new AbstractMethodNotImplementedException();
    }

    async createUser(userData, service) {
        throw new AbstractMethodNotImplementedException();
    }

    async updateUserPassword(uuid, newPassword, service) {
        throw new AbstractMethodNotImplementedException();
    }
}

module.exports = UserPersistenceInterface;