/** @abstract */
class Connector {
    constructor(settings = {}) {
        if (Object.getPrototypeOf(this) === Connector.prototype) {
            throw `Connector is abstract`;
        }
    }

    async findUser(email, password, service) {
        return null;
    }

    async createUser(userData = { passowrd: 'password', email: 'a@a.com', role: 'member'}) {
        return null;
    }
}

module.exports = Connector;