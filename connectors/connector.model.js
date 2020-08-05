/** @abstract */
class Connector {
    constructor(settings = {}) {
        if (Object.getPrototypeOf(this) === Connector.prototype) {
            throw `Connector is abstract`;
        }
    }

    async findUser() {
        return null;
    }
}

module.exports = Connector;