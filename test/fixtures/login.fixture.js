const now = Date.now();
const validEmail =  `toto${now}@tata.com`;

const applications = require('./application.fixture');


const users =  {
    existingUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "API_KEY": applications[0].API_KEY
    },

    existingUserOnAnotherApp: {
        "email": validEmail,
        "password": "azertyuiop321",
        "API_KEY": applications[1].API_KEY
    },

    missingPassword: {
        "email": validEmail,
        "API_KEY": applications[0].API_KEY
    },

    missingEmail: {
        "password": "azertyuiop321",
        "API_KEY": applications[0].API_KEY
    }
};

module.exports = {
    users,
    applications
};