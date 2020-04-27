import { exportDao } from '../common/dbHelper'
import { PlainObject, MysqlResult } from '@/type'

// const userDao = exportDao({
// 	sql: null,
// 	count: 'select count(*) as count from user where ?',
// 	getUser: 'select * from user where ?',
// 	insert: 'insert into user set ?',
// 	update: 'update user set ? where id = ?',
// 	delete: 'delete from user where ?'
// });


export const sql = exportDao('');
export const count: (arg: PlainObject) => Promise<PlainObject[]> = exportDao('select count(*) as count from user where ?')
export const getUser: (arg: PlainObject) => Promise<PlainObject[]> = exportDao('select * from user where ?')
export const insert: (arg: PlainObject) => Promise<MysqlResult> = exportDao('insert into user set ?')
export const update: (arg: any[]) => Promise<MysqlResult> = exportDao('update user set ? where id = ?')
export const del: (arg: PlainObject) => Promise<MysqlResult> = exportDao('delete from user where ?')