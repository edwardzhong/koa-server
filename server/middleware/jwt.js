const jwt = require('jsonwebtoken')
const log = require('../common/logger')

module.exports = opt => {
    const config = Object.assign({ secret: 'JEFFJWT', exp: 3600, renewal: false }, opt);
    return async (ctx, next) => {
        ctx.sign = (payload, exp) => {
            // 签发Token, 并添加到header中
            const token = jwt.sign(payload, config.secret, { expiresIn: exp || config.exp });
            ctx.set('Authorization', `Bearer ${token}`);
            ctx.state.payload = payload;
        };

        const resolve = async () => {
            if (!ctx.header || !ctx.header.authorization) {
                return { isValid: false, msg: 'authorization null' };
            }
            const parts = ctx.header.authorization.split(' ');
            const credentials = parts.slice(-1)[0];
            // if (parts.length === 2) return null;
            // const scheme = parts[0];
            // if (!/^Bearer$/i.test(scheme)) return null;
            try {
                let ret = await jwt.verify(credentials, config.secret);
                ret.isValid = true;
                if (ctx.state.payload && config.renewal && typeof ctx.sign === 'function') { //小于过期时间段一半的时候自动续期
                    if (new Date(ret.exp * 1000) - new Date() < Math.floor(config.exp / 2)) {
                        ctx.sign(ctx.state.payload);
                        ret.exp = new Date().getTime() / 1000;
                    }
                }
                return ret;
            } catch (err) {//验证不通过的三种类型 name: TokenExpiredError(过期) | JsonWebTokenError(token解释错误) | NotBeforeError(还未到生效期)
                err.isValid = false;
                err.url = ctx.url;
                log.error(err);
                return err;
            }
        };
        ctx.state.token = await resolve();
        next();
    };
};
