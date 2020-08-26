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
};

module.exports = AuthenthicatorFrontController;