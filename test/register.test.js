//During the test the env variable is set to test
process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
const assert = chai.assert;

let chaiHttp = require('chai-http');
let server = require('../app');

const aws = require('aws-sdk');
aws.config.update({
    region: process.env.DYNAMO_REGION,
    accessKeyId: process.env.DYNAMO_ACCESS_KEY_ID,
    secretAccessKey: process.env.DYNAMO_SECRET_KEY_ID
});

const dynamo = new aws.DynamoDB();
const DocumentClient = new aws.DynamoDB.DocumentClient();

const STATUS_CODE = require('../app/config/status-code.config');

const users = require('./fixtures/register.fixture');

const hashKey = 'email';
const rangeKey = 'application_uuid';

function buildKey(obj){
    var key = {};
    key[hashKey] = obj[hashKey]
    if(rangeKey){
        key[rangeKey] = obj[rangeKey];
    }
    
    return key;
}

chai.use(chaiHttp);
//Our parent block
describe('[Dynamo] Register', () => {
    before((done) => {
       
        try {
            dynamo.scan({
                TableName: process.env.USER_ENTITY
            }, function(err, data) {
            if (err) console.error(err)
                    Promise.all(data.Items.map(function(obj,i){
                        return new Promise(resolve => {
                    
                            var params = {
                                TableName:process.env.USER_ENTITY,
                                Key: buildKey(obj),
                            };
                    
                            console.log(params)
                            DocumentClient.delete(params, function(err, data) {
                                if (err) console.error(err);
                                console.log('deleted', data)
                               resolve();
                            });
                        })
                      
                     
                    })).then(() => done());
                  
                
            });
     
        }

        catch(error) {
            console.error(error);
            done();
        }
        
      
    });
/*
  * Test the /GET route
  */
  describe('/api/register', () => {
      it('should detect missing email', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.missingEmail)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect invalid email', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.invalidEmail)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect missing password', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.missingPassword)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect missing confirm password', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.missingConfirm)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect missing app', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.missingApp)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect password mismatch', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.missingApp)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
              
                done();
            });
      });

      it('should detect password too weak (based on length)', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.passwordTooWeak)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 200);
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.message, STATUS_CODE.PASSWORD_TOO_WEAK);
              
                done();
            });
      });

      it('should detect invalid customer-app', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.unknownApp)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 401);
               
              
                done();
            });
      });

      it('should register valid user', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.validUser)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 200);
               
              
                done();
            });
      });

      it('should prevent duplicated user', (done) => {
        chai.request(server)
            .post('/api/register')
            .send(users.existingUser)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 200);
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
               
              
                done();
            });
      });
  });
});