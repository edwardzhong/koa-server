const pool = require("./dbPool").getPool();
const log = require('../common/logger');

module.exports = opts => Object.keys(opts).reduce((next, key) => {
    next[key] = (...args) => new Promise((resolve, reject) => {
        if (opts[key]) args.unshift(opts[key]);
        log.info('=== execute sql ===')
        log.info(args);
        pool.query(...args,(err, result, fields) => {
            if (err) reject(err)
            else resolve(result);
        });
    });
    return next;
}, {});
