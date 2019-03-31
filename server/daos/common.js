const pool = require("./dbPool").getPool();
const log = require('../common/logger');

/**
 * export named query function
 * @param {plain Object} opts 
 */
const exportDao = opts => Object.keys(opts).reduce((next, key) => {
    next[key] = (...args) => new Promise((resolve, reject) => {
        if (opts[key]) args.unshift(opts[key]);
        log.info('====== execute sql ======')
        log.info(args);
        pool.query(...args, (err, result, fields) => {// fields is useless
            if (err) reject(err)
            else resolve(result);
        });
    });
    return next;
}, {});

/**
 * just promiseful query
 * @param  {...any} args 
 */
const query = (...args) => {
    return new Promise((resolve, reject) => {
        log.info('====== execute sql ======')
        log.info(args);
        pool.query(...args, (err, result, fields) => {// fields is useless
            if (err) reject(err)
            else resolve(result);
        });
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
const transaction = list => {
    return new Promise((resolve, reject) => {
        if (!Array.isArray(list) || !list.length) return reject('it needs a Array with sql')
        pool.getConnection((err, connection) => {
            if (err) return reject(err);
            connection.beginTransaction(err => {
                if (err) return reject(err);
                log.info('============ begin execute transaction ============')
                let rets = [];
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
                        connection.query(...args, (error, ret) => {
                            if (error) {
                                connection.rollback();
                                connection.release();
                                return reject(error);
                            }
                            rets.push(ret);
                            dispatch(i + 1);
                        });
                    }
                })(0);
            });
        });
    })
}

module.exports = {
    exportDao,
    query,
    transaction
};