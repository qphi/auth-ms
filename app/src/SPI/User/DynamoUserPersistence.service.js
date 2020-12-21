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


    async findByCredentials(email, password, applicationSettings = {}) {
        const result =  await this.model.get({ 
            email,
            application_uuid: applicationSettings.MS_UUID
        });


        if (
            typeof result !== 'undefined' &&
            result.password === password
        ) {
            const _id = result.user_uuid;
            delete result.user_uuid;

            return {
                _id,
                ...result
            };
        }

        else {
            return null;
        }
    }

    async getUserUUID(email, applicationSettings) {
        /**
         * @type {{
         *     user_uuid: string
         * }}
         */
        const user = await this.model.get({ 
            email,
            application_uuid: applicationSettings.MS_UUID
        });

        console.log(user);

        return user.user_uuid;
    }

    /**
     * @override
     * @param {Object} userData
     * @param {Object} applicationSettings
     */
    async create(userData, applicationSettings) {
        userData.application_uuid = applicationSettings.MS_UUID;

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
                application_uuid: applicationSettings.MS_UUID
            }, 
            // updates
            {
                password: newPassword
            }
        );
    }
}

module.exports = DynamoUserPersistence;