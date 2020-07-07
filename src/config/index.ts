import { PoolConfig } from 'mysql';

/**
 * app config
 */
export const app = {
  secret: 'JEFFJWT',
  exp: 60 * 60 * 24,//1 hour  or Eg: 60, "2 days", "10h", "7d".
};

/**
 * mysql database config
 */
export const db: PoolConfig = {
  host: "localhost",
  port: 3306,
  user: "root",
  password: "jianfeng",
  database: "chatdb",
  charset: 'utf8mb4',//utf8mb4才能保存emoji
  // socketPath: '/var/lib/mysql/mysql.sock',
  multipleStatements: true,// 可同时查询多条语句, 但不能参数化传值
  connectionLimit: 100
};

/**
 * logger config
 */
export const log4js = {
  appenders: {
    out: {
      type: 'stdout',
      layout: { type: 'basic' }
    },
    file: {
      type: 'file',
      filename: 'logs/system.log',
      maxLogSize: 10485760,
      backups: 3,
      compress: true,
      layout: {
        type: 'pattern',
        pattern: '[%d{yyyy/MM/dd:hh.mm.ss}] %p %c - %m%n'
      }
    }
  },
  categories: { default: { appenders: ['file'], level: 'info' } }
};