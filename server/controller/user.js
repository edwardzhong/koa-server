const mysql = require('mysql')
const { stringFormat } = require('../common/util')
const userDao = require('../daos/user')

const formatTime = i => {
    const d = new Date(i.create_date * 1000),
        n = new Date(),
        day = n.getDate() - d.getDate(),
        date = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':' + ('0' + d.getSeconds()).slice(-2);
    if (day == 0) {
        i.date = `${date}`
    } else if (day == 1) {
        i.date = `昨天 ${date}`
    } else {
        i.date = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ${date}`
    }
    return i;
};

exports.index = async function (ctx) {
    ctx.render('index.html');
};


exports.updateInfo = async function (ctx) {
    const form = ctx.request.body;
    const token = await ctx.verify();
    const ret = await userDao.update([form, token.uid]);
    if (!ret.affectedRows) {
        return ctx.body = {
            code: 2,
            message: '更新失败'
        };
    }
    ctx.body = {
        code: 0,
        message: '更新成功'
    };
}


exports.delFriend = async function (ctx) {
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
    ctx.body = {
        code: 0,
        message: '删除好友成功'
    };
}

exports.search = async function (ctx) {
    const { kw } = ctx.query;
    const k1 = mysql.escape(kw + '%'), k2 = mysql.escape('%' + kw + '%');
    const sql = stringFormat("select * from user where name like $1 or name like $2 or nick like $1 or nick like $2 or cast(num as char) like $1", k1, k2);
    const gSql = stringFormat("select a.*,b.nick as create_name from `group` a left join `user` b on a.create_id = b.id where a.name like $1 or b.name like $2", k1, k2);
    const [users, groups] = await Promise.all([userDao.sql(sql), userDao.sql(gSql)]);
    ctx.body = {
        code: 0,
        message: '搜索成功',
        data: { users, groups }
    };
}