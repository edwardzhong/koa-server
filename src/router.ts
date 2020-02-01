import 'reflect-metadata'
import fs from 'fs'
import path from 'path'
import verify from './middleware/verify'
import { ROUTER_MAP } from './constant'
import { RouteMeta } from './type'
import Router from 'koa-router'

const addRouter = (router: Router) => {
  const ctrPath = path.join(__dirname, 'controller');
  const modules: any[] = [];
  //扫描controller文件夹，加载所有controller
  fs.readdirSync(ctrPath).forEach(name => {
    if (/^[^.]+?\.(t|j)s$/.test(name)) {
      modules.push(require(path.join(ctrPath, name)).default)
    }
  });
  // 结合meta数据添加路由 和 验证
  modules.forEach(m => {
    const routerMap: RouteMeta[] = Reflect.getMetadata(ROUTER_MAP, m, 'method') || [];
    if (routerMap.length) {
      const ctr = new m();
      routerMap.forEach(route => {
        const { name, method, path, isVerify } = route;
        router[method](path, verify(path, isVerify), ctr[name]);
      })
    }
  })
}

export default addRouter