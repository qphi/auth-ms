const { DynamoProvider, ResourceModelFactory, ResourceSchema } = require('rest-api');

const day_in_ms = 86400000;
const _6hours = 21600000;

const JWTSchema = ResourceSchema({
    namespace: 'auth-jwt',
    primaryKey: 'key',
    schema: {
        kind: {type: String, required: true},
        key: {type: String, required: true},
        payload: {type: String, require: false},
        expire: {type: Number, require: true},
        target: {type: String, require: false, default: ''}
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

        JWTSchema.target.index = {
            name: context.params.DYNAMO_TOKEN_TARGET_INDEX_NAME,
            global: true
        };

        console.log('=========>',  context.params.DYNAMO_TOKEN_TARGET_INDEX_NAME)
        super(
            ResourceModelFactory.fromSchema(
                context.entity.jwt,
                JWTSchema,
                'dynamo',
                {
                    expires: {
                        ttl: Math.ceil(day_in_ms / 1000)
                    }
                }
            ),

            {
                id: 'key'
            }
        );

        this.index =  {
            DYNAMO_TOKEN_TARGET_INDEX_NAME: context.params.DYNAMO_TOKEN_TARGET_INDEX_NAME
        }
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
            tokenData.expire < (Date.now() / 1000)
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
            target: refreshToken,
            payload: '',
            expire: Math.ceil((Date.now() + day_in_ms) / 1000)
        });
    }

    remove(selectors) {
        // @todo https://github.com/qphi/auth-ms/projects/1#card-51616891
    }

    async storeForgotPasswordToken(token, data) {
        const target = data.target;
        delete data.target;
        return await this.create({
            key: token,
            payload: JSON.stringify(data),
            kind: TOKEN_TYPE.FORGOT,
            expire: Math.ceil((Date.now() + 30 * 60000) / 1000),
            target
        });
    }

    async getForgotPasswordToken(token) {
        const tokenData = await this.findTokenByTarget(token, TOKEN_TYPE.FORGOT);
        
        if (tokenData !== null) {
            return JSON.parse(tokenData.payload);
        }

        else {
            return {};
        }
    }

    async findTokenByTarget(target, type) {
        const result = await this.model.query('target').eq(target).using(this.index.DYNAMO_TOKEN_TARGET_INDEX_NAME).exec();

        console.log('result', result);

        if (result.count === 0) {
            return null
        }

        else {
            return result[0];
        }
    }

    async deleteToken(token) {
       return await this.deleteById(token);
    }
}

module.exports = DynamoJWTPersistence;