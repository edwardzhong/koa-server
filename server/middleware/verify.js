/**
 * api login interceptors (aop) (path array)
 * include: need to verify
 * exclude: the rest need verify
 * if empty, all need to verify
 */
module.exports = opt => {
    const config = Object.assign({ include: [], exclude: [] }, opt||{});
    return async (ctx, next) => {
        if (config.exclude.length && config.exclude.includes(ctx.path)) {
            return await next();
        }
        if (config.include.length && !config.include.includes(ctx.path)) {
            return await next();
        }
        const token = await ctx.verify();
        if (!token.isValid) {
            ctx.redirect('/sign');
            // return ctx.body = {
            //     code: 1,
            //     message: '未登录'
            // };
        }
        await next();
    };
};