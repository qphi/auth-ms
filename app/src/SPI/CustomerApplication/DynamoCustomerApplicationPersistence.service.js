const { DynamoProvider, ResourceModelFactory } = require('rest-api');

const ApplicationNameIsNotAvailableException = require('../../Exceptions/ApplicationNameIsNotAvailable.exception');
/**
 * @implements {CustomerApplicationPersistenceInterface}
 */

 // @todo move API_INDEX name to config parameter (loader with env var)
class DynamoCustomerApplicationPersistence extends DynamoProvider {
    constructor(context) {
        const schema =  require('../../Domain/CustomerApplication/customerApplication.schema');
        schema.MS_UUID.hashKey = true;
        schema.API_KEY.index = {
            name: context.params.DYNAMO_API_KEY_INDEX_NAME,
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
            API_KEY: context.params.DYNAMO_API_KEY_INDEX_NAME
        }
    }

    async create(settings) {
        let response = null;
        
        try {
            response = await super.create(settings);
        }
        
        catch(error) {
            if (error.code === 'ConditionalCheckFailedException') {
                const exists = await this.model.get(settings.MS_UUID);
                if (typeof exists !== 'undefined') {
                    console.log('je lance lecpet');
                    throw new ApplicationNameIsNotAvailableException(settings.name);
                }
            }           
        }

        return response;
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

    async findById(_id) {
        const result = await this.model.get(_id);
        return result;
    }

    async deleteById(_id) {
        // || true in order to inducate that deletion was successful even if no elt was deleted (dynamoose cant return nb item deleted for now)
        return await this.model.delete( _id) || true;
    }

    async updateById(_id, updates) {
        // update name is forbidden !
        if (typeof updates.name !== 'undefined') {
            delete updates.name;    
        }

        return await super.updateById(_id, updates);
    }
}

module.exports = DynamoCustomerApplicationPersistence;