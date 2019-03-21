/**
 * api login interceptors (aop) 
 */
module.exports = opt => {
    const config = Object.assign([], opt);
    return async (ctx, next) => {
        if(config.includes(ctx.path)){
            const token = await ctx.verify();
            if (!token.isValid) {
                return ctx.body = {
                    code: 2,
                    message: '未登录'
                };
            }
        }
        await next();
    };
};