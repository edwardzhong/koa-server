const { exportDao } = require('./common');

// const userDao = exportDao({
// 	sql: null,
// 	count: 'select count(*) as count from user where ?',
// 	getUser: 'select * from user where ?',
// 	insert: 'insert into user set ?',
// 	update: 'update user set ? where id = ?',
// 	delete: 'delete from user where ?'
// });


export const sql = exportDao('');
export const count = exportDao('select count(*) as count from user where ?')
export const getUser = exportDao('select * from user where ?')
export const insert = exportDao('insert into user set ?')
export const update = exportDao('update user set ? where id = ?')
export const del = exportDao('delete from user where ?')