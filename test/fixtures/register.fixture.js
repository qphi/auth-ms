const now = Date.now();
const validEmail =  `toto${now}@tata.com`;

module.exports = {
    missingEmail: {
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop123",
        "app": "books"
    },

    invalidEmail: {
        "email": "toto",
        "password": "azertyuiop123",
        "confirmPassword": "azertyuiop123",
        "app": "books"
    },

    missingPassword: {
        "email": validEmail,
        "confirmPassword": "azertyuiop123",
        "app": "books"
    },

    missingConfirm: {
        "email": validEmail,
        "password": "azertyuiop123",
        "app": "books"
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
        "app": "books"
    },

    passwordTooWeak: {
        "email": validEmail,
        "password": "admin",
        "confirmPassword": "admin",
        "app": "books"
    },

    unknownApp: {
        "email":  validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "app": "gagagagagagag"
    },

    validUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "app": "books"
    },

    existingUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "confirmPassword": "azertyuiop321",
        "app": "books"
    }
}