const now = Date.now();
const validEmail =  `toto${now}@tata.com`;

module.exports = {
    existingUser: {
        "email": validEmail,
        "password": "azertyuiop321",
        "app": "books"
    },

    existingUserOnAnotherApp: {
        "email": validEmail,
        "password": "azertyuiop321",
        "app": "test-2"
    },

    missingPassword: {
        "email": validEmail,
        "app": "books"
    },

    missingEmail: {
        "password": "azertyuiop321",
        "app": "books"
    }
}