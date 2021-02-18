//During the test the env variable is set to test
process.env.NODE_ENV = 'test';


//Require the dev-dependencies
let chai = require('chai');
const assert = chai.assert;

let chaiHttp = require('chai-http');
let server = require('../app');
const purgeDB = require('./purge-db.command');

const { STATUS_CODE } = require('auth-ms-sdk');

const users = require('./fixtures/register.fixture');

chai.use(chaiHttp);
//Our parent block
describe('[Dynamo] Register', () => {
    before(done => {
        purgeDB().then(done);     
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
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.message, STATUS_CODE.MISSING_EMAIL);
                
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
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.message, STATUS_CODE.INVALID_EMAIL);
                assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                
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
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.message, STATUS_CODE.MISSING_PASSWORD);
                
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
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.message, STATUS_CODE.MISSING_CONFIRM_PASSWORD);
                
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
                assert.strictEqual(res.body.status, STATUS_CODE.PROCESS_ABORTED);
                assert.strictEqual(res.body.error, STATUS_CODE.NO_ERROR);
                assert.strictEqual(res.body.message, STATUS_CODE.UNKNOWN_APPLICATION);
                
                
                done();
            });
        });
        
        it('should register valid user', (done) => {
            chai.request(server)
            .post('/api/register')
            .send(users.validUser)
            .end((err, res) => {
                assert.isNull(err);
                assert.strictEqual(res.statusCode, 201);
                
                
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