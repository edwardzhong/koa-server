import mysql from 'mysql'
import { stringFormat } from '../common/util'
import * as userDao from '../daos/user'
import { Context } from 'koa';


// export const index = async (ctx: Context) => {
//     ctx.render('index.html');
// };


export const userInfo = async (ctx: Context) => {
    const token = await ctx.verify();
    const users = await userDao.getUser({ id: token.uid });
    if (!users.length) {
        return ctx.body = {
            code: 1,
            message: '用户不存在'
        };
    } else {
        return ctx.body = {
            code: 0,
            data: users[0],
            message: '用户存在'
        };
    }
}

export const updateInfo = async (ctx: Context) => {
    const form = ctx.request.body;
    const token = await ctx.verify();
    const ret = await userDao.update([form, token.uid]);
    if (!ret.affectedRows) {
        return ctx.body = {
            code: 2,
            message: '更新失败'
        };
    }
    return ctx.body = {
        code: 0,
        message: '更新成功'
    };
}


export const delFriend = async (ctx: Context) => {
    const { friend_id } = ctx.request.body;
    const token = await ctx.verify();
    const sql = stringFormat("delete from user_friend where user_id in ('$1','$2') and friend_id in ('$1','$2')", token.uid, friend_id);
    const ret = await userDao.sql(sql);
    if (!ret.affectedRows) {
        return ctx.body = {
            code: 2,
            message: '删除好友失败'
        };
    }
    return ctx.body = {
        code: 0,
        message: '删除好友成功'
    };
}

export const search = async (ctx: Context) => {
    const { kw } = ctx.query;
    const k1 = mysql.escape(kw + '%'), k2 = mysql.escape('%' + kw + '%');
    const sql = stringFormat("select * from user where name like $1 or name like $2 or nick like $1 or nick like $2 or cast(num as char) like $1", k1, k2);
    const gSql = stringFormat("select a.*,b.nick as create_name from `group` a left join `user` b on a.create_id = b.id where a.name like $1 or b.name like $2", k1, k2);
    const [users, groups] = await Promise.all([userDao.sql(sql), userDao.sql(gSql)]);
    return ctx.body = {
        code: 0,
        message: '搜索成功',
        data: { users, groups }
    };
}