const { ResourceSchema } = require('rest-api');

module.exports = ResourceSchema({
    namespace: 'user',
    primaryKey: 'uuid',
    schema: { 
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: {type: String, required: true, default: ''},
        uuid: { type: String },
        application_uuid: { type: String, required: true }
    }
});
    