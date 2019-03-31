const jwt = require('jsonwebtoken')
const log = require('../common/logger')

/**
 * json web token
 */
module.exports = opt => {
    const config = Object.assign({ secret: 'JEFFJWT', exp: 3600 }, opt);
    return async (ctx, next) => {
        ctx.sign = (payload, exp) => {
            // 签发Token, 并添加到header中
            const token = jwt.sign(payload, config.secret, { expiresIn: exp || config.exp });
            ctx.set('Authorization', `Bearer ${token}`);
        };

        ctx.verify = async () => {
            if (!ctx.header || !ctx.header.authorization) {
                return { isValid: false, msg: 'authorization null' };
            }
            const parts = ctx.header.authorization.split(' ');
            const credentials = parts.slice(-1)[0];
            try {
                let ret = await jwt.verify(credentials, config.secret);
                ret.isValid = true;
                return ret;
            } catch (err) {//验证不通过的三种类型 name: TokenExpiredError(过期) | JsonWebTokenError(token解释错误) | NotBeforeError(还未到生效期)
                err.isValid = false;
                err.url = ctx.url;
                log.error(err);
                return err;
            }
        };
        await next();//注意要加上 await
    };
};
