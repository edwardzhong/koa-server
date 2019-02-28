/**
 * database connect pool utility
 * 数据库连接池工具类
 */
const mysql = require('mysql');
const dbconfig = require('../config/db');
const log = require('../common/logger').logger();
var pool = null;

/**
 * get the connection of database
 * 获取数据库连接
 * @param callback
 */
exports.getConnection = function (callback) {
    log.info('=== dbPool ===');
    if (!pool) {
        log.info("创建数据库连接池");
        pool = mysql.createPool(dbconfig);
    }

    pool.getConnection(function (err, connection) {
        //获取数据库连接出错
        if (err || !connection) {
            log.error("获取数据库连接失败：" + err.code);
            throw err;
        }
        callback(connection);
    });
}

/**
 * get the connection pool of database
 * 获取数据库连接池
 * @returns {*}
 */
exports.getPool = function () {
    if (!pool) {
        log.info("创建数据库连接池");
        pool = mysql.createPool(dbconfig);
    }
    return pool;
}
