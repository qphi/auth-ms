const { DynamoProvider, ResourceModelFactory } = require('rest-api');
const UserAlreadyExistsException = require('../../Exceptions/UserAlreadyExists.exception');

/**
 * @implements {UserPersistenceInterface}
 */
class DynamoUserPersistence extends DynamoProvider {
    constructor(context) {
        const schema =  require('../../Domain/User/user.schema');
        schema.email.hashKey = true;
        schema.application_uuid.rangeKey = true;
        super(
            ResourceModelFactory.fromSchema(
                context.entity.user,
               schema,
                'dynamo'
            ),

            {
                id: 'user_uuid'
            }
        );
    }


    async findByCredentials(email, password, clientSettings = {}) {
        const result =  await this.model.get({ 
            email,
            application_uuid: clientSettings.MS_UUID
        });


        if (
            typeof result !== 'undefined' &&
            result.password === password
        ) {
            return result;
        }

        else {
            return null;
        }
    }

    async getUserUUID(email, service) {
        const user = await this.model.get({ 
            email,
            application_uuid: clientSettings.MS_UUID
        });

        return user.uuid;
    }

    /**
     * @override
     * @param {Mixed} userData 
     * @param {Mixed} clientSettings 
     */
    async create(userData, clientSettings) {
        userData.application_uuid = clientSettings.MS_UUID;

        try {
            await super.create(userData);
            success = true;
        }

        catch(error) {
            throw new UserAlreadyExistsException();
        }
       
    }

    async updatePassword(uuid, newPassword, service) {
        return await this.model.update(
            // selector
            {
                uuid,
                application_uuid: clientSettings.MS_UUID
            }, 
            // updates
            {
                password: newPassword
            }
        );
    }
}

module.exports = DynamoUserPersistence;