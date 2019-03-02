const userDao = require('../daos/user')

exports.index = async function (ctx) {
    ctx.render('index.html');
};

exports.userInfo = async function (ctx) {
    try {
        const token = await ctx.verify();
        if (!token.isValid) {
            return ctx.body = {
                code: 2,
                msg: '未登录'
            };
        }
        const users = await userDao.query({ id: token.uid });
        if (!users.length) {
            return ctx.body = {
                code: 1,
                msg: '不存在该用户'
            };
        }
        ctx.body = {
            code: 0,
            msg: '用户信息',
            data: users[0]
        };
    } catch (err) {
        ctx.body = {
            code: -1,
            msg: '服务器错误',
            err: err
        };
    }
};
