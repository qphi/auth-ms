const { DynamoProvider, ResourceModelFactory } = require('rest-api');

/**
 * @implements {CustomerApplicationPersistenceInterface}
 */

 // @todo move API_INDEX name to config parameter (loader with env var)
class DynamoCustomerApplicationPersistence extends DynamoProvider {
    constructor(context) {
        const schema =  require('../../Domain/CustomerApplication/customerApplication.schema');
        schema.MS_UUID.hashKey = true;
        schema.API_KEY.index = {
            name: context.param.DYNAMO_API_KEY_INDEX_NAME,
            global: true
        };

        super(
            ResourceModelFactory.fromSchema(
                context.entity.ms_recorded,
               schema,
                'dynamo'
            ),
           
            {
                id: 'MS_UUID'
            }
        );

        this.index =  {
            API_KEY: context.param.DYNAMO_API_KEY_INDEX_NAME
        }
    }

     /**
     * @param {String} secret 
     */
    async findByAPIKey(api_key) {
        const result = await this.model.query('API_KEY').eq(api_key).using(this.index.API_KEY).exec();

        if (result.count === 0) {
            return null
        }
     
        else {
            return result[0];
        }
      
    }
}

module.exports = DynamoCustomerApplicationPersistence;