import jsonWebToken from 'jsonwebtoken'
import log from '../common/logger'
import { app } from '../config';
import { MiddleWare } from '@/type';

/**
 * jwt verify
 * @param path 
 * @param isVerify 
 */
const verify: MiddleWare = (path: string, isVerify:boolean) => async (ctx, next) => {
  // 签发Token, 并添加到header中
  ctx.sign = (payload: { uid: string; email: string }, exp: number) => {
    const token = jsonWebToken.sign(payload, app.secret, { expiresIn: exp || app.exp });
    ctx.set('Authorization', `Bearer ${token}`);
  };
  if (isVerify && path === ctx.path) {
    if (!ctx.header || !ctx.header.authorization) {
      ctx.status = 403;
      ctx.body = { code: 3, message: 'Authorization not exist' };
    } else {
      const parts = ctx.header.authorization.split(' ');
      const credentials = parts.slice(-1)[0];
      try {
        ctx.state.token = await jsonWebToken.verify(credentials, app.secret);
        await next();
      } catch (err) {//验证不通过的三种类型 name: TokenExpiredError(过期) | JsonWebTokenError(token解释错误) | NotBeforeError(还未到生效期)
        err.url = ctx.url;
        log.error(err);
        ctx.status = 403;
        ctx.body = { code: 3, err, message: 'Authorization fail' };
      }
    }
  } else {
    await next();
  }
};

export default verify;