import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import Router from 'koa-router';
import { RouteMeta } from './type'
import { ROUTER_MAP } from './constant'

const addRouters = (router: Router) => {
    const ctrPath = path.join(__dirname, 'controller');
    const modules: any[] = [];
    //扫描controller文件夹，加载所有controller
    fs.readdirSync(ctrPath).forEach(name => {
        if (/^.+?\.(t|j)s$/.test(name)) {
            modules.push(require(path.join(ctrPath, name)).default)
        }
    });
    // 结合meta数据添加路由
    modules.forEach(m => {
        const routeMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, m, 'method') || [];
        if (routeMap.length) {
            const ctr = new m();
            routeMap.forEach(route => {
                const { name, method, path } = route;
                router[method](path, ctr[name]);
            })
        }
    })
};

export default addRouters