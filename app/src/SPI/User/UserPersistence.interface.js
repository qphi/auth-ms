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
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    async getUserUUID(email, service) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }

    async createUser(userData, service) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());  
    }

    async updateUserPassword(uuid, newPassword, service) {
        throw new AbstractMethodNotImplementedException(arguments.callee.toString());
    }
}

module.exports = UserPersistenceInterface;