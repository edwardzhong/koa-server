import { MiddleWare } from '@/type';

/**
 * api login interceptors (aop) (path array)
 * include: need to verify
 * exclude: the rest need verify
 * if empty, all need to verify
 */
const verify: MiddleWare = (config: { include?: string[]; exclude?: string[] }) => async (ctx, next) => {
    if (config.exclude && config.exclude.length && config.exclude.includes(ctx.path)) {
        return await next();
    }
    if (config.include && config.include.length && !config.include.includes(ctx.path)) {
        return await next();
    }
    const token = await ctx.verify();
    if (token.code !== 0) {
        return ctx.body = token;
    }
    await next();
};

export default verify;