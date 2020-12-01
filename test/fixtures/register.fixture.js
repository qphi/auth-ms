const now = Date.now();
const validEmail =  `toto${now}@tata.com`;

const applications = require('./application.fixture');

module.exports = {
    missingEmail: {
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop123",
        "API_KEY": applications[0].API_KEY
    },

    invalidEmail: {
        "email": "toto",
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop123",
        "API_KEY": applications[0].API_KEY
    },

    missingPassword: {
        "email": validEmail,
        "confirmPassword": "azertyuiop123",
        "API_KEY": applications[0].API_KEY
    },

    missingConfirm: {
        "email": validEmail,
        "password": "azertyuiop123",
        "API_KEY": applications[0].API_KEY
    },

    missingApp: {
        "email": validEmail,
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop123",
    },

    passwordMismatch: {
        "email": validEmail,
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop321",
        "API_KEY": applications[0].API_KEY
    },

    passwordTooWeak: {
        "email": validEmail,
        "password": "admin",
        "confirmPassword": "admin",
        "API_KEY": applications[0].API_KEY
    },

    unknownApp: {
        "email":  validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "API_KEY": "gagagagagagag"
    },

    validUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "API_KEY": applications[0].API_KEY
    },

    existingUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "API_KEY": applications[0].API_KEY
    }
}