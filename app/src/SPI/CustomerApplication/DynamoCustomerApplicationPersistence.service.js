const { DynamoProvider, ResourceModelFactory } = require('rest-api');

/**
 * @implements {CustomerApplicationPersistenceInterface}
 */
class DynamoCustomerApplicationPersistence extends DynamoProvider {
    constructor(context) {
        super(
            ResourceModelFactory.fromSchema(
                context.entity.ms_recorded,
                require('../../Domain/User/user.schema'),
                'dynamo'
            ),
           
            {
                id: 'MS_UUID'
            }
        );
    }
}

module.exports = DynamoCustomerApplicationPersistence;