const { exportDao } = require('./common');

module.exports = exportDao({
	sql: null,
	count: 'select count(*) as count from user where ?',
	getUser: 'select * from user where ?',
	insert: 'insert into user set ?',
	update: 'update user set ? where id = ?',
	delete: 'delete from user where ?'
});
