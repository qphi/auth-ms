const { ResourceSchema } = require('rest-api');

module.exports = ResourceSchema({
    namespace: 'customer-application',
    primaryKey: 'MS_UUID',
    schema: {
        DB_TYPE: {type: String, required: true},
        JWT_ACCESS_TTL: { type: Number, required: true},
        JWT_SECRET_ACCESSTOKEN: { type: String, required: true },
        JWT_SECRET_REFRESHTOKEN: { type: String, required: true },
        JWT_SECRET_FORGOTPASSWORDTOKEN: { type: String, required: true },
        MS_UUID: { type: String, required: true},
        COOKIE_JWT_ACCESS_NAME: { type: String, required: true },
        COOKIE_JWT_REFRESH_NAME: { type: String, required: true },
        SALT: { type: String, required: true }
    }
});
    