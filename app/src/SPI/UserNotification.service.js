class UserNotificationService {
    constructor(context) {
        this.services = {
        }
    }

    notifyForgotPassword(email, token, applicationSettings) {
       console.log(
           "=== UserNotificationService::notifyForgotPassword ===",
           {
               email, token, name: applicationSettings.name, url: applicationSettings.host + '/api/reset-password?token=' + token
           }
       )
    }
}

module.exports = UserNotificationService;