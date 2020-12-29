const fs = require('fs');

module.exports = path => {
    return new Promise(resolve => {
        fs.readFile(path, function (err, data) {
            if (error) {
                resolve(error);
            } else {
                resolve(data);
            }
        })
    })
};