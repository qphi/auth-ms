const { Singleton } = require('micro'); 

class RequestHelper {
    constructor() {}
}

module.exports = Singleton.create(RequestHelper);

