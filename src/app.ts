import path from 'path'
import http from 'http'
import koa from 'koa'
import logger from 'koa-logger'
import koaStatic from 'koa-static'
import koaBody from 'koa-body'
import koaRouter from 'koa-router'
import favicon from 'koa-favicon'
import socket from 'socket.io'

import { app as config } from './config'
import log from './common/logger'
import addRouter from './router'
import addSocket from './socket'
import tpl from './middleware/tpl'
import errorHandler from './middleware/error'

const app = new koa()
const router = new koaRouter();
const server = http.createServer(app.callback())
const socketServer = socket(server)
const baseDir = path.normalize(__dirname + '/..')

// display access records
app.use(logger());

// session

// parse request
app.use(koaBody({
  jsonLimit: 1024 * 1024 * 5,
  formLimit: 1024 * 1024 * 5,
  textLimit: 1024 * 1024 * 5,
  multipart: true,// 解析FormData数据
  formidable: { uploadDir: path.join(__dirname, 'upload') }
}));

// set static directory
app.use(koaStatic(path.join(baseDir, 'public'), { index: false }));
app.use(favicon(path.join(baseDir, 'public/favicon.jpg')));

// set template engine
app.use(tpl({ path: baseDir + '/public' }));

// handle the error
app.use(errorHandler());

// add route
addRouter(router);
app.use(router.routes()).use(router.allowedMethods());

// deal 404
app.use(async ctx => {
  log.error(`404 ${ctx.message} : ${ctx.href}`);
  ctx.status = 404;
  ctx.body = '404! page not found !';
  // ctx.render('404.html');
});

// koa already had middleware to deal with the error, just register the error event
app.on('error', (err, ctx) => {
  log.error(err);//log all errors
  ctx.status = 500;
  ctx.statusText = 'Internal Server Error';
  if (ctx.app.env === 'development') { //throw the error to frontEnd when in the develop mode
    ctx.res.end(err.stack); //finish the response
  } else {
    ctx.render('Server Error');
  }
});

if (!module.parent) {
  let { port, socketPort } = config;
  //如果是pm2 cluster模式
  const instance = process.env.NODE_APP_INSTANCE;
  if (instance) {
    socketPort += parseInt(instance, 10);
  }

  /**
   * koa app
   */
  app.listen(port);
  // http.createServer(app.callback()).listen(port);// does the same like: app.listen(port)
  log.info(`=== app server running on port ${port}===`);
  console.log('app server running at: http://localhost:%d', port);

  /**
   * socket.io
   */
  addSocket(socketServer);
  server.listen(socketPort);
  log.info(`=== socket listening on port ${socketPort} ===`)
  console.log('socket server running at: http://localhost:%d', socketPort);
}