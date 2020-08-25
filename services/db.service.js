const ConnectorsAvailables = require('../connectors');

const Connector = require('../connectors/connector.model');

class DBService {
    constructor(consumers = {}) {
        /** @type Connector[] */
        this.connectors = {};

        for (const consumer in consumers) {
            const dbClient = consumer.DB_TYPE || 'mysql';
            if (typeof this.connectors[dbClient] === 'undefined') {
                this.loadConnector(dbClient);
            }
        }
    }

    getConnector(connectorName = 'mysql') {
        if (typeof this.connectors[connectorName] === 'undefined') {
            this.loadConnector(connectorName);
        }

        return this.connectors[connectorName];
    }

    loadConnector(connectorName) {
        try {
            const connector = ConnectorsAvailables[connectorName];

            if (typeof connector === 'undefined') {
                throw `Unable to find connector ${connectorName}`;
            }

            this.connectors[connectorName] = new connector();
        } 

        catch(error) {
            console.error(error);
        }
    }

    async record(service) {
        const connector = this.getConnector(service.DB_TYPE);
        return await connector.record(service);
    }

    async findUser(email, password, service) {
        const connector = this.getConnector(service.DB_TYPE);
        return await connector.findUser(email, password, service);
    }

    async getUserUUID(email, service) {
        const connector = this.getConnector(service.DB_TYPE);
        return await connector.getUserUUID(email, service);
    }

    async createUser(userData, service) {
        const connector = this.getConnector(service.DB_TYPE);
        return await connector.createUser(userData, service);
    }

    async updateUserPassword(uuid, newPassword, service) {
        const connector = this.getConnector(service.DB_TYPE);
        return await connector.updateUserPassword(uuid, newPassword, service);

    }
}

module.exports = DBService;