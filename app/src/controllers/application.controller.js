const { BaseController } = require('micro');
const sha256 = require('sha256');
const crypto = require('crypto');
const uuid = require('uuid');


const STATUS_CODE = require('../../config/status-code.config');
const assertions = {
    'string-not-empty': value => typeof value === 'string' && value.length > 0
}

function check(assertion, value) {
    const checker = assertions[assertion];

    if (typeof checker !== 'function') {
        return false;
    }

    else {
        return checker(value);
    }
}

const ApplicationNameIsNotAvailableException = require('../Exceptions/ApplicationNameIsNotAvailable.exception');
const { STATUS_CODES } = require('http');

class ApplicationController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);

        this.api = {
            requestAdapter: settings.api.requestAdapter || require('../API/request.helper'),
            /** @type {ResponseHelper} */
            responseHelper: settings.api.responseAdapter
        };

        this.spi = {
            /** @type {CustomerApplicationPersistenceInterface} */
            customerApplicationPersistence: settings.spi.customerApplicationPersistence
        }

        this.params = {
            HTTPSignaturePublicKey: settings.params.HTTPSignaturePublicKey
        };
    }

    async create(request, response) {
        const name = request.body.name;

        if (!check('string-not-empty', name)) {
            return response.status(401).json({
                message: 'missing attribute: name',
                status: STATUS_CODE.PROCESS_ABORTED
            })
        }
       
        const SALT = crypto.randomBytes(16);
        const settings = {
            name: name,
            icon_src: '',

            JWT_ACCESS_TTL: 180,
            JWT_SECRET_ACCESSTOKEN: sha256(`jwt-${name}-access-token-${SALT}`), 
            JWT_SECRET_REFRESHTOKEN: sha256(`jwt-${name}-refresh-token-${SALT}`), 
            JWT_SECRET_FORGOTPASSWORDTOKEN: sha256(`jwt-${name}-forgotpassword-token-${SALT}`), 
            MS_UUID: uuid.v5(name, process.env.MS_UUID),
            API_KEY:  uuid.v5(name + SALT, process.env.MS_UUID),
            COOKIE_JWT_ACCESS_NAME: sha256(`jwt-${name}-access-cookie-${SALT}`), 
            COOKIE_JWT_REFRESH_NAME: sha256(`jwt-${name}-refresh-cookie-${SALT}`),
            SALT: `${SALT}`,
            host: request.body.host || request.headers.host
        }

        let status = null;
        let data = {
            error: STATUS_CODE.NO_ERROR,
            status: STATUS_CODE.PROCESS_DONE
        };

        try {
            const record = await this.spi.customerApplicationPersistence.create(settings);
            if (record !== null) {
                status = 201;
                delete record.MS_UUID;
                delete record.SALT;
                data.message = record;
            }

            else {
                status = 200;
                data.message = 'wtf ?';
            }
        }

        catch (error) {
            if (error instanceof ApplicationNameIsNotAvailableException) {
                status = 200;
                data.message = 'ApplicationNameIsNotAvailableException';
                data.status = STATUS_CODE.PROCESS_ABORTED;
            }

            else {
                status = 500;
                data.message = 'unknown error';
                console.error(error);
            }
        }

        finally {
            return response.status(status).json(data);
        }
    }

    async list(request, response) {
        const results =  await this.spi.customerApplicationPersistence.list();
        return response.json(results);
    }

    async setPublicKey(request, response) {
        const application_uuid = request.params.ms_id;
        const result = await this.spi.customerApplicationPersistence.updateById(application_uuid, {
            public_key: response.body.public_key
        });

        return response.status(200).json({
            status: STATUS_CODE.PROCESS_DONE,
            error: STATUS_CODE.NO_ERROR,
            message: STATUS_CODE.UPDATE_SUCCESS
        });
    }
    
    async findByAPIKey(request, response) {
        const { API_KEY } = request.applicationSettings;
        const result = await this.spi.customerApplicationPersistence.findByAPIKey(API_KEY);

        return response.json(result); 
    }

    async findById(request, response) {
        const application_uuid = request.params.ms_id;
        const result = await this.spi.customerApplicationPersistence.findById(application_uuid);
        
        return response.json(result); 
    }

    async deleteById(request, response) {
        return response.status(200).json({
            status: STATUS_CODE.PROCESS_ABORTED,
            error: STATUS_CODE.NO_ERROR,
            message: STATUS_CODE.DELETE_APP_IS_FORBIDDEN
        });  
    }

    async disableById(request, response) {
        const application_uuid = request.params.ms_id;
        const result = await this.spi.customerApplicationPersistence.updateById(application_uuid, {
            enabled: false
        });

        return response.status(200).json({
            status: STATUS_CODE.PROCESS_DONE,
            error: STATUS_CODE.NO_ERROR,
            message: STATUS_CODE.UPDATE_SUCCESS
        });
    }

    async enableById(request, response) {
        const application_uuid = request.params.ms_id;
        const result = await this.spi.customerApplicationPersistence.updateById(application_uuid, {
            enabled: true
        });

        return response.status(200).json({
            status: STATUS_CODE.PROCESS_DONE,
            error: STATUS_CODE.NO_ERROR,
            message: STATUS_CODE.UPDATE_SUCCESS
        });  
    }


    async updateById(request, response) {
        const application_uuid = request.params.ms_id;
        const updates = request.body;
        let result = null;
        try {
            result = await this.spi.customerApplicationPersistence.updateById(application_uuid, updates);
        }

        catch (error) {
            console.error(error);
            // move into dynamo spi and replace with domain exception
            if (error.code === 'ValidationException') {
                response.status(401).json({
                    error: STATUS_CODE.NO_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED,
                    message: STATUS_CODES.UPDATE_BAD_FORMAT
                });
            }
           
            else {
                response.status(500).json({
                    error: STATUS_CODE.WITH_ERROR,
                    status: STATUS_CODE.PROCESS_ABORTED,
                    message: STATUS_CODE.UNKNOWN_ERROR
                });
            }
        }
      
        return response.json({
            error: STATUS_CODE.NO_ERROR,
            status: STATUS_CODE.PROCESS_DONE,
            message: STATUS_CODE.UPDATE_SUCCESS
        });
    }
};

module.exports = ApplicationController;