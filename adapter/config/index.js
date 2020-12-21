const { Test } = require('mocha');
const AuthRequestHelper = require('../src/request.helper');
const TestController = require('../test/test.controller');

function InjectContextFactory(type, target = '') {
    return context => {
        const instance = new type(context);

        if (typeof target === 'string' && target.length > 0) {

            let currentNode = context;
            let lastNode = context;

            const sections = target.split('.');
            let currentSection = sections[0];
            let iterator = 0;

            while (iterator < sections.length) {
               
                currentSection = sections[iterator];
                if (typeof currentNode[currentSection] === 'undefined') {
                    currentNode[currentSection] = {};
                }

                lastNode = currentNode;
                currentNode = currentNode[currentSection];
                ++iterator;
            }
            
            lastNode[currentSection] = instance;
        }

        return instance;
    }
}

module.exports = {
    api: {
        userRequestAdapter: require('../../app/src/API/UserRequest.helper')
    },

    state: {},
    params: {},
    services: {
        
    },

    controllers: {
        test: new TestController(), 
    },

    factories: [
        // InjectContextFactory(AuthRequestHelper, 'api.authRequestHelper')
    ]
};