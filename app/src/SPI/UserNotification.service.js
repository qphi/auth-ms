class UserNotificationService {
    constructor(context) {
        this.services = {
        }
    }

    notifyForgotPassword(email, token, applicationSettings) {
       console.log(
           "=== UserNotificationService::notifyForgotPassword ===",
           {
               email, token, name: applicationSettings.name
           }
       )
    }
}

module.exports = UserNotificationService;