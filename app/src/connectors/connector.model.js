/** @abstract */
class Connector {
    constructor(settings = {}) {
        if (Object.getPrototypeOf(this) === Connector.prototype) {
            throw `Connector is abstract`;
        }
    }

    async record(service) {
        return null;
    }

    async findUser(email, password, service) {
        return null;
    }

    async updateUserPassword(uuid, newPassword, service) {
        return null;
    }

    async getRecord(ms_uuid) {
        return null;
    }

    async getUserUUID(email, service) {
        return null;
    }

    async createUser(userData = { passowrd: 'password', email: 'a@a.com', role: 'member'}) {
        return null;
    }
}

module.exports = Connector;