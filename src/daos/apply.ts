import { exportDao } from './common'
import { MysqlResult } from '@/type';

// const applyDao = exportDao({
//     sql: null,
//     getApply: 'select a.*, c.name as group_name, b.nick, b.avatar, b.email, b.signature, b.num from `apply` a join `user` b on a.from_id = b.id left join `group` c on a.group_id = c.id where to_id = ? order by create_date desc',
//     apply: 'insert into apply set ?',
//     reply: 'update apply set ? where id = ? and to_id = ?'
// });

export const sql = exportDao('');
export const getApply: (id: string) => Promise<{ [P: string]: any }> = exportDao('select a.*, c.name as group_name, b.nick, b.avatar, b.email, b.signature, b.num from `apply` a join `user` b on a.from_id = b.id left join `group` c on a.group_id = c.id where to_id = ? order by create_date desc')
export const apply: (arg: { [P: string]: any }) => Promise<MysqlResult> = exportDao('insert into apply set ?')
export const reply: (arg: any[]) => Promise<MysqlResult> = exportDao('update apply set ? where id = ? and to_id = ?')