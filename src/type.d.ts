import { Context, Next } from "koa"

type ResData = {
    code: number;
    message?: string;
    data?: any;
    err?: any;
}
// type PlainObject = { [P: string]: any };
type PlainObject = Record<string, any>;
type MysqlResult = {
    affectedRows?: number;
    insertId?: string;
} | PlainObject

type KoaFun<T> = (ctx: Context, next?: Next) => Promise<T>
type MiddleWare = (arg?: any) => KoaFun<void>
type RouteMeta = {
    name: string;
    method: string;
    path: string;
}

export {
  ResData,
  MysqlResult,
  PlainObject,
  MiddleWare,
  KoaFun,
  RouteMeta
}