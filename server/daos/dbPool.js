/**
 * database connect pool utility
 * 数据库连接池工具类
 */
const mysql = require('mysql');
const dbconfig = require('../config/db');
const log = require('../common/logger');
let pool = null;

/**
 * get the connection of database
 * 获取数据库连接
 */
exports.getConnection = function (callback) {
    if (!pool) {
        log.info("creating pool");
        pool = mysql.createPool(dbconfig);
    }
    pool.getConnection(function (err, connection) {
        if (err || !connection) {
            log.error(err);
        } else {
            callback(connection);
        }
    });
}

/**
 * get the connection pool of database
 * 获取数据库连接池
 */
exports.getPool = function () {
    if (!pool) {
        log.info("creating pool");
        pool = mysql.createPool(dbconfig);
    }
    return pool;
}
