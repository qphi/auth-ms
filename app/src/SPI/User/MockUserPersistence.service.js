const fixtures = require('../../../../test/fixtures/login.fixture').users;
const crypto = require('crypto');
const sha256 = require('sha256');

class MockUserPersistence {
    constructor(context) {
    }

    async findByCredentials(email, password, clientSettings = {}) {
        try {
            const users = Object.values(fixtures);
            const user = users.find(usr => {
                return (
                    typeof usr.email !== 'undefined' &&
                    sha256(usr.email) === email &&
                    usr.registered.indexOf(clientSettings.MS_UUID) >= 0
                );
            })
    
            if (typeof user !== 'undefined' &&
                sha256(user.password) === password
            ) {
                return user;
            }
    
            else {
                return null;
            }
        }

        catch(err) {
            console.error(err);
        }
      
    }

    async getUserUUID(email, service) {
        const users = Object.values(fixtures);
        const user = users.find(usr => {
            return (
                typeof usr.email !== 'undefined' &&
                sha256(usr.email) === email &&
                usr.registered.indexOf(clientSettings.MS_UUID) >= 0
            );
        })

        if (typeof user !== 'undefined') {
            return user.uuid;
        }

        else {
            return null;
        }
    }

    /**
     * @override
     * @param {Mixed} userData 
     * @param {Mixed} clientSettings 
     */
    async create(userData, clientSettings) {
        userData.application_uuid = clientSettings.MS_UUID;
        const id = crypto.randomBytes(16);
        userData.uuid = id;

        if (await this.getUserUUID(userData.email, { MS_UUID: userData.MS_UUID }) === null) {
            fixtures[id] = userData;
        }

        else {
            throw new UserAlreadyExistsException();
        }
    }

    async updatePassword(uuid, newPassword, service) {
        const users = Object.values(fixtures);
        const user = users.find(usr => {
            return (
                usr.uuid === uuid &&
                usr.registered.indexOf(clientSettings.MS_UUID) >= 0
            );
        })

        user.password = newPassword;
    }
}

module.exports = MockUserPersistence;