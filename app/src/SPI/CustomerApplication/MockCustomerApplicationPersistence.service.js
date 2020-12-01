const fixtures = require('../../../../test/fixtures/application.fixture');

class MockCustomerApplicationPersistence {
    constructor(context) {
        this.applications = fixtures;
    }

    /**
     * @param {String} secret 
     */
    async findByAPIKey(secret) {
        const app = this.applications.find(clientApp => {
            return clientApp.API_KEY === secret;
        });

        return app || null;
    }
}

module.exports = MockCustomerApplicationPersistence;