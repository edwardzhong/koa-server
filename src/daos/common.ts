import { getPool } from "./dbPool"
import log from '../common/logger'
import { queryCallback } from 'mysql'
const pool = getPool();

type MysqlResult = {
    affectedRows?: number;
    insertId?: string;
}
const exportDao = (sql: string) => {
    return (...args: any): Promise<MysqlResult> => new Promise((resolve, reject) => {
        log.info('====== execute sql ======')
        log.info(sql, args);
        const callback: queryCallback = (err, result) => {
            if (err) reject(err)
            else resolve(result);
        }
        if (!sql) sql = args.shift();
        
        pool.query(sql, ...args, callback);
    });
}

/**
 * sql transaction
 * @param  {Array} list 
 * const rets = await transaction([
 *     ["insert into user_group values (?,?)",[11,11]],
 *     ["insert into user_friend set ? ",{user_id:'12',friend_id:12}],
 *     'select * from user'
 * ]);
 */
const transaction = (list: any): Promise<MysqlResult[]> => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(list) || !list.length) return reject('it needs a Array with sql')
        pool.getConnection((err, connection) => {
            if (err) return reject(err);
            connection.beginTransaction(err => {
                if (err) return reject(err);
                log.info('============ begin execute transaction ============')
                let rets: MysqlResult[] = [];
                return (function dispatch(i) {
                    let args = list[i];
                    if (!args) {//finally commit
                        connection.commit(err => {
                            if (err) {
                                connection.rollback();
                                connection.release();
                                return reject(err);
                            }
                            log.info('============ success executed transaction ============')
                            connection.release();
                            resolve(rets);
                        });
                    } else {
                        log.info(args);
                        args = typeof args == 'string' ? [args] : args;
                        const sql = args.shift();
                        const callback: queryCallback = (error, ret) => {
                            if (error) {
                                connection.rollback();
                                connection.release();
                                return reject(error);
                            }
                            rets.push(ret);
                            dispatch(i + 1);
                        }
                        connection.query(sql, ...args, callback);
                    }
                })(0);
            });
        });
    })
}

export {
    exportDao,
    transaction
};