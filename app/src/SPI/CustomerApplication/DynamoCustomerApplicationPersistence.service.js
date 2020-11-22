

const { Singleton } = require('micro'); 
const { DynamoProvider, ResourceModelFactory } = require('rest-api');

/**
 * @implements {CustomerApplicationPersistenceInterface}
 */
class DynamoCustomerApplicationPersistence extends DynamoProvider {
    constructor() {
        super(
            ResourceModelFactory.fromSchema(
                'customer-application',
                require('../../Domain/User/user.schema'),
                'dynamo'
            ),
           
            {
                id: 'MS_UUID'
            }
        );
    }
}

module.exports = Singleton.create(DynamoCustomerApplicationPersistence);