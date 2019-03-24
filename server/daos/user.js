const exportFunctions = require('./exportDao');

module.exports = exportFunctions({
	sql:null,
	count: 'select count(*) as count from user where ?',
	query: 'select * from user where ?',
	insert: 'insert into user set ?',
	update: 'update user set ?',
	delete: 'delete from user where ?'
});
