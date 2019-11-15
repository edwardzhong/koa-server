const log = require('../common/logger')

/**
 * error handler
 */
module.exports = () => {
    return async (ctx, next) => {
        try {
            await next();
        } catch (err) {
            log.error(err);
            let obj = {
                code: -1,
                message: '服务器错误'
            };
            if (ctx.app.env === 'development') {
                obj.err = err;
            }
            ctx.body = obj
        }
    };
};