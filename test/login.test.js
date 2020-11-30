//During the test the env variable is set to test
process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
const assert = chai.assert;

let chaiHttp = require('chai-http');
let server = require('../app');

const STATUS_CODE = require('../app/config/status-code.config');

const users = require('./fixtures/login.fixture');
const purgeDB = require('./purge-db.command');
const axios = require('axios');

const loginURL = '/api/login';

chai.use(chaiHttp);
//Our parent block
describe('[Dynamo] Login', () => {
    before(done => {
        purgeDB().then(() => {
            const port = process.env.PORT;
       
            //done();
            axios.post('http://localhost:' + port + '/api/register', {
                confirmPassword: users.existingUser.password,
                ...users.existingUser
            }).then(
                (data) => {
                    done();
                }
            ).catch(err => {
                console.error(err);
                done();
            });

        });  
        
    });

    describe(`POST ${loginURL}`, () => {
        it('should detect missing email', (done) => {
            chai.request(server)
                .post(loginURL)
                .send(users.missingEmail)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.strictEqual(res.statusCode, 401);
                    assert.strictEqual(res.body.message, STATUS_CODE.MISSING_EMAIL);
                    assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                    assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                
                    done();
                });
            }
        );

        it('should detect missing password', (done) => {
            chai.request(server)
                .post(loginURL)
                .send(users.missingPassword)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.strictEqual(res.statusCode, 401);
                    assert.strictEqual(res.body.message, STATUS_CODE.MISSING_PASSWORD);
                    assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                    assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                
                    done();
                });
            }
        );

        it('can login existing user', (done) => {
            chai.request(server)
                .post(loginURL)
                .send(users.existingUser)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.strictEqual(res.statusCode, 200);
                    assert.strictEqual(res.body.message, STATUS_CODE.LOGIN_SUCCESSFUL);
                    assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                    assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_DONE);
                
                    done();
                });
            }
        );

        it('If an user is not register to an app, login will fail', (done) => {
            chai.request(server)
                .post(loginURL)
                .send(users.existingUserOnAnotherApp)
                .end((err, res) => {
                    assert.isNull(err);
                    assert.strictEqual(res.statusCode, 401);
                    assert.strictEqual(res.body.message, STATUS_CODE.BAD_CREDENTIALS);
                    assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                    assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_DONE);
                
                    done();
                });
            }
        );
    });
});