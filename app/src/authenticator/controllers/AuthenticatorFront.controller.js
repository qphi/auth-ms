const BaseController = require("../../BaseController.controller");

class AuthenthicatorFrontController extends BaseController {
    constructor(settings = { services : {} }) {
        super(settings);
    }


    renderForgetPassword(request, response) {
        const service = request.service;


        response.render('forgot-password', {
            service_name: service.name,
            service_img: service.ICON_SRC
        });
    }



    renderLogin(request, response) {
        response.render('admin/login', {
            // service_name: service.name,
            // service_img: service.ICON_SRC
        });
    }

    renderCreateService(request, response) {
        

        response.render('admin/create-service', {
            // service_name: service.name,
            // service_img: service.ICON_SRC
        });
    }

    async renderShowService(request, response) {
        const ms_uuid = '46487d3b-0d30-5161-9792-ca9eb1558b9d';
        const record = await this.services.db.getRecord(ms_uuid);
        console.log(record);
        response.render('admin/show-service', record);
    }
};

module.exports = AuthenthicatorFrontController;