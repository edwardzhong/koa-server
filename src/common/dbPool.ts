/**
 * database connect pool utility
 * 数据库连接池工具类
 */
import mysql, { Pool } from 'mysql'
import { db as dbConfig } from '../config'
import log from './logger'
let pool: Pool = null;

/**
 * get the connection of database
 * 获取数据库连接
 */
export const getConnection = (callback: Function) => {
  if (!pool) {
    log.info("creating pool");
    pool = mysql.createPool(dbConfig);
  }
  pool.getConnection((err, connection) => {
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
export const getPool = () => {
  if (!pool) {
    log.info("creating pool");
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}