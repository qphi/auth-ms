const ApplicationRouter = require('./application.router');
const CoreRouter = require('./core.router');

module.exports = ctx => {
    return [].concat(
        ApplicationRouter(ctx),
        CoreRouter(ctx)
    );
}