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

        schema.user_uuid.index = {
            name: context.params.DYNAMO_USER_FindByUUID_INDEX_NAME,
            rangeKey: 'application_uuid',
            global: true
        };

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

        this.index =  {
            DYNAMO_USER_FindByUUID_INDEX_NAME: context.params.DYNAMO_USER_FindByUUID_INDEX_NAME
        }
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

    async findByUUID(user_uuid, application_uuid) {
        const result = await this.model.query({
            'user_uuid': user_uuid,
            'application_uuid': application_uuid
        }).using(this.index.DYNAMO_USER_FindByUUID_INDEX_NAME).exec();

        console.log(result);

        if (result.count === 0) {
            return null
        }

        else {
            return result[0];
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
        }

        catch(error) {
            throw new UserAlreadyExistsException();
        }
       
    }

    async updatePassword(uuid, newPassword, applicationSettings) {
        const user = await this.findByUUID(uuid, applicationSettings.MS_UUID);
        // todo utiliser un index spécial OU changer utiliser l'email pour faire la requête
        return await this.model.update(
            // selector
            {
                email: user.email,
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