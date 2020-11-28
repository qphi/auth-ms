const { BaseController } = require('micro');

class BackOfficeController extends BaseController {
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


    async renderListServices(request, response) {
        const apps = await this.services.api.listAllServices();
        response.render('admin/list-services', {
            apps: apps
            // service_name: service.name,
            // service_img: service.ICON_SRC
        });
    }

    async renderShowService(request, response) {
        const ms_uuid = request.params.ms_uuid;
    

        const record = await this.services.db.getRecord(ms_uuid);
    
        try {

            response.render('admin/show-service', {
                app: record
            });
        }

        catch(e) {
            console.log('aa');
        }
    }
};

module.exports = BackOfficeController;