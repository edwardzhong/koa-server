let pool = require("./dbPool").getPool();
const log = require('../common/logger').logger();

function createMethod(obj) {
    let exportsFn = {};
    for (let [key, value] of Object.entries(obj)) {
        exportsFn[key] = function (param) {
            return new Promise((resolve, reject) => {
                let callback = (err, result, fields) => {
                    if (err) reject(err)
                    else resolve(result);
                };
                log.info('=== dalHelper ===');
                if (value) {
                    log.info('sql:' + value);
                    let str = param;
                    if (Object.prototype.toString.call(param).slice(8, -1).toLowerCase() == 'object') {
                        str = '{';
                        for (let p in param) {
                            str += `${p}:${param[p]},`;
                        }
                        str = str.slice(0, -1);
                        str += '}';
                    }
                    log.info('param:' + str);
                    pool.query(value, param, callback);
                } else {
                    log.info('sql:' + param);
                    pool.query(param, callback);
                }
            });
        };
    }
    return exportsFn;
}

module.exports = {
    createMethod
};
