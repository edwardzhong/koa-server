const { exportDao } = require('./common');

module.exports = exportDao({
    sql: null,
    getApply: 'select a.*, c.name as group_name, b.nick, b.avatar, b.email, b.signature, b.num from `apply` a join `user` b on a.from_id = b.id left join `group` c on a.group_id = c.id where to_id = ? order by create_date desc',
    apply: 'insert into apply set ?',
    reply: 'update apply set ? where id = ? and to_id = ?'
});