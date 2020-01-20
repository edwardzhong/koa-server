import { Context, Next } from 'koa';

/**
 * api login interceptors (aop) (path array)
 * include: need to verify
 * exclude: the rest need verify
 * if empty, all need to verify
 */
const verify = (opt: { include?: string[]; exclude?: string[] }) => {
    const config = Object.assign({ include: [], exclude: [] }, opt || {});
    return async (ctx: Context, next: Next) => {
        if (config.exclude.length && config.exclude.includes(ctx.path)) {
            return await next();
        }
        if (config.include.length && !config.include.includes(ctx.path)) {
            return await next();
        }
        const token = await ctx.verify();
        if (!token.uid) {
            // ctx.redirect('/sign');
            return ctx.body = {
                code: 2,
                message: '未登录'
            };
        }
        await next();
    };
};

export default verify;