import log from '../common/logger'
import { Context, Next } from 'koa';
import { ResData } from '../type';

/**
 * error handler
 */
const errorHandler = () => {
    return async (ctx: Context, next: Next) => {
        try {
            await next();
        } catch (err) {
            log.error(err);
            let obj: ResData = {
                code: -1,
                message: '服务器错误',
            };
            if (ctx.app.env === 'development') {
                obj.err = err;
            }
            ctx.body = obj
        }
    };
};

export default errorHandler