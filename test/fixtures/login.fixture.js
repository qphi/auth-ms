const now = Date.now();
const validEmail =  `toto${now}@tata.com`;

const applications = require('./application.fixture');


const users =  {
    existingUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "registered": [applications[0].API_KEY],
        "API_KEY": applications[0].API_KEY
    },

    existingUserOnAnotherApp: {
        "email": validEmail,
        "password": "azertyuiop321",
        "registered": [applications[0].API_KEY],
        "API_KEY": applications[1].API_KEY
    },

    unknownUser: {
        "email": validEmail + 'aa',
        "password": "azertyuiaaop321",
        "registered": [],
        "API_KEY": 'unknown'
    },

    missingPassword: {
        "email": validEmail,
        "API_KEY": applications[0].API_KEY,
        "registered": [],
    },

    missingEmail: {
        "password": "azertyuiop321",
        "API_KEY": applications[0].API_KEY,
        "registered": []
    }
};

module.exports = {
    users,
    applications
};