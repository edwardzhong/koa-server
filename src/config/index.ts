import { PoolConfig } from 'mysql';

/**
 * app config
 */
export const app = {
    isDev: process.env.NODE_ENV == 'development',
    client: 'http://localhost:4001',//允许访问接口的客户端地址
    host: "localhost",
    port: 3000,
    socketPort: 3001,
    secret: 'JEFFJWT',
    exp: 60 * 60,
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