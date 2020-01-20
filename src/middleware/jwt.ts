import jsonWebToken from 'jsonwebtoken'
import log from '../common/logger'
import { app as config } from '../config';
import { Context, Next } from 'koa';

/**
 * json web token
 */
const jwt = () => {
    return async (ctx: Context, next: Next) => {
        ctx.sign = (payload: { uid: string; email: string }, exp: number) => {
            // 签发Token, 并添加到header中
            const token = jsonWebToken.sign(payload, config.secret, { expiresIn: exp || config.exp });
            ctx.set('Authorization', `Bearer ${token}`);
        };

        ctx.verify = async () => {
            if (!ctx.header || !ctx.header.authorization) {
                return { isValid: false, msg: 'authorization null' };
            }
            const parts = ctx.header.authorization.split(' ');
            const credentials = parts.slice(-1)[0];
            try {
                let ret = await jsonWebToken.verify(credentials, config.secret);
                return ret;
            } catch (err) {//验证不通过的三种类型 name: TokenExpiredError(过期) | JsonWebTokenError(token解释错误) | NotBeforeError(还未到生效期)
                err.url = ctx.url;
                log.error(err);
                return err;
            }
        };
        await next();//注意要加上 await
    };
};

export default jwt
