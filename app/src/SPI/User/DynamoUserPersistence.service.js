

const { Singleton } = require('micro'); 
const { DynamoProvider, ResourceModelFactory } = require('rest-api');

/**
 * @implements {UserPersistenceInterface}
 */
class DynamoUserPersistence extends DynamoProvider {
    constructor() {
        super(
            ResourceModelFactory.fromSchema(
                'user',
                require('../../Domain/User/user.schema'),
                'dynamo'
            ),

            {
                id: 'uuid'
            }
        );
    }


    async findByCredentials(email, password, clientSettings = {}) {
        return await this.model.get({ 
            email,
            password,
            application_uuid: clientSettings.MS_UUID
        });
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
        super.create(userData);
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

module.exports = Singleton.create(DynamoUserPersistence);