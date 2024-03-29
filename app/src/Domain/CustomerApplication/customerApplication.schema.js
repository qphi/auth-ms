const { ResourceSchema } = require('rest-api');

module.exports = ResourceSchema({
    namespace: 'customer-application',
    primaryKey: 'MS_UUID',
    schema: {
        // DB_TYPE: {type: String, required: true},
        name: {type: String, required: true },
        host: {type: String, required: true },
        img_src: {type: String, required: false, default: '' },
        useCustomForgotPassword: {type: Boolean, required: false, default: false },
        JWT_ACCESS_TTL: { type: Number, required: true},

        JWT_SECRET_ACCESSTOKEN: { type: String, required: true },
        JWT_PUBLIC_ACCESSTOKEN: { type: String, required: true },

        JWT_SECRET_REFRESHTOKEN: { type: String, required: true },
        JWT_PUBLIC_REFRESHTOKEN: { type: String, required: true },

        JWT_SECRET_FORGOTPASSWORDTOKEN: { type: String, required: true },
        JWT_PUBLIC_FORGOTPASSWORDTOKEN: { type: String, required: true },

        signaturePublic: { type: String, required: false, default: null },

        MS_UUID: { type: String, required: true},
        API_KEY: { type: String, required: true },
        COOKIE_JWT_ACCESS_NAME: { type: String, required: true },
        COOKIE_JWT_REFRESH_NAME: { type: String, required: true },
        SALT: { type: String, required: true },
        enabled: { type: Boolean, required: true, default: true },
    }
});
    