const { DynamoProvider, ResourceModelFactory, ResourceSchema } = require('rest-api');

const day_in_ms = 86400000;
const _6hours = 21600000;

const JWTSchema = ResourceSchema({
    namespace: 'auth-jwt',
    primaryKey: 'key',
    schema: { 
        kind: { type: String, required: true },
        key: { type: String, required: true },
        payload: { type: String, require: false },
        expire: { type: Number, require: true }
    }
});
    

const TOKEN_TYPE = {
    REFRESH: 'refresh',
    FORGOT: 'forgot',
    IDENTITY: 'identity',
};

/**
 * @implements {UserPersistenceInterface}
 */
class DynamoJWTPersistence extends DynamoProvider {
    constructor(context) {
        super(
            ResourceModelFactory.fromSchema(
                context.entity.jwt,
                JWTSchema,
                'dynamo',
                {
                    expires: {
                        ttl: day_in_ms
                    }
                }
            ),

            {
                id: 'key'
            }
        );
    }

     /**
     * @param {string} refreshToken 
     */
    async hasRefreshToken(refreshToken = '') {
       const token = await this.findToken(refreshToken, TOKEN_TYPE.REFRESH);
       return token !== null;
    }

    async findToken(key, kind) {
        const tokenData = await this.findById(key);

        if (
            tokenData !== null &&
            tokenData.kind === kind &&
            tokenData.expire < Date.now()
        ) {
            return tokenData;
        }

        else {
            return null;
        }
    }

    async storeRefreshToken(refreshToken) {
        return await this.create({
            key: refreshToken,
            kind: TOKEN_TYPE.REFRESH,
            payload: '',
            expire: parseInt(Date.now() + day_in_ms, 10)
        });
    }

    async storeForgotPasswordToken(token, data) {
        return await this.create({
            key: token,
            payload: JSON.stringify(data),
            kind: TOKEN_TYPE.FORGOT,
            expire: Date.now() + _6hours
        });
    }

    async getForgotPasswordToken(token) {
        const tokenData = await this.findToken(token, TOKEN_TYPE.FORGOT);
        
        if (tokenData !== null) {
            return JSON.parse(tokenData.payload);
        }

        else {
            return {};
        }
    }

    async deleteToken(token) {
       return await this.deleteById(token);
    }
}

module.exports = DynamoJWTPersistence;