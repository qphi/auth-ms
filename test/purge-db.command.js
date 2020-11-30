const { param } = require('../app/src/dev.application-state');

const hashKey = 'email';
const rangeKey = 'application_uuid';
    
function buildKey(obj){
    var key = {};
    key[hashKey] = obj[hashKey].S
    if(rangeKey){
        key[rangeKey] = obj[rangeKey].S;
    }
    
    return key;
}

module.exports = () => {
    return new Promise(resolve => {
        const aws = require('aws-sdk');

        aws.config.update({
            region: process.env.DYNAMO_REGION,
            accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
            secretAccessKey: process.env.DYNAMO_SECRET_KEY_ID
        });
        
        const dynamo = new aws.DynamoDB();
        const DocumentClient = new aws.DynamoDB.DocumentClient();

        try {
            dynamo.scan({
                TableName: process.env.USER_ENTITY
            }, function(err, data) {
            if (err) console.error(err)
                    Promise.all(data.Items.map(function(obj,i){
                        return new Promise(resolveDeleteItem => {
                    
                            var params = {
                                TableName:process.env.USER_ENTITY,
                                Key: buildKey(obj),
                            };
            
                            DocumentClient.delete(params, function(err, data) {
                                if (err) console.error(err);
                                resolveDeleteItem();
                            });
                        });
                    })).then(() => resolve());
                  
                
            });
     
        }
    
        catch(error) {
            console.error(error);
            resolve();
        }
    });
};
