const { DynamoProvider, ResourceModelFactory } = require('rest-api');

/**
 * @implements {CustomerApplicationPersistenceInterface}
 */
class DynamoCustomerApplicationPersistence extends DynamoProvider {
    constructor(context) {
        super(
            ResourceModelFactory.fromSchema(
                context.entity.ms_recorded,
                require('../../Domain/CustomerApplication/customerApplication.schema'),
                'dynamo'
            ),
           
            {
                id: 'MS_UUID'
            }
        );
    }

     /**
     * @param {String} secret 
     */
    async findByAPIKey(api_key) {
        const app = await this.model.query({ api_key });

        console.log(app);
        return app || null;
    }
}

module.exports = DynamoCustomerApplicationPersistence;