const dotenv = require('dotenv');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const BaseController = require('./BaseController.controller');

class MicroService extends BaseController {
    constructor(settings = {}) {
        super(settings);

        dotenv.config({
            path: settings.env
        });

        this.app = express();
        
        this.port = settings.port || process.env.PORT;

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({
            extended: true
          }));
        this.app.use(helmet());
    }
  
    start() {
        this.app.listen(this.port, () => {
            console.log(`${this.constructor.name} started on port ${this.port}`);
        });
    }
}

module.exports = MicroService;