const ConnectorsAvailables = require('../connectors');

const Connector = require('../connectors/connector.model');

class APIService {
    constructor(settings = {}) {
        this.services = settings.services || {};

        if (typeof this.services.db === 'undefined') {
            throw `A db service must be provided`;
        }
    }

    async listAllServices() {
        const connexion = await this.services.db.getConnexion('mysql');
        const results = await connexion.query(` 
            SELECT * FROM ms_public_data;
        `);

        this.services.db.releaseConnexion(connexion, 'mysql');
        return results;
    }
}

module.exports = APIService;