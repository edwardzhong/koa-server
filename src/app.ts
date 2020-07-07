import path from 'path'
import koa from 'koa'
import koaStatic from 'koa-static'
import koaBody from 'koa-body'
import koaRouter from 'koa-router'
import favicon from 'koa-favicon'

import log from './common/logger'
import addRouter from './router'
import tpl from './middleware/tpl'
import errorHandler from './middleware/error'

const app = new koa()
const router = new koaRouter();
const baseDir = path.normalize(__dirname + '/..')

// session

// parse request
app.use(koaBody({
  jsonLimit: 1024 * 1024 * 5,
  formLimit: 1024 * 1024 * 5,
  textLimit: 1024 * 1024 * 5,
  multipart: true,// 解析FormData数据
  formidable: { uploadDir: path.join(baseDir, 'upload') }
}));

// set static directory
app.use(koaStatic(path.join(baseDir, 'public'), { index: false }));
app.use(favicon(path.join(baseDir, 'public/favicon.jpg')));

// set template engine
app.use(tpl({ path: path.join(baseDir, 'public') }));

// handle the error
app.use(errorHandler());

// add route
addRouter(router);
app.use(router.routes()).use(router.allowedMethods());

// deal 404
app.use(async ctx => {
  log.error(`404 ${ctx.message} : ${ctx.href}`);
  ctx.status = 404;
  ctx.body = '404! content not found !';
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
  const port = process.env.PORT;
  app.listen(port);
  // http.createServer(app.callback()).listen(port);// does the same like: app.listen(port)
  log.info(`=== app server running on port ${port}===`);
  console.log('app server running at: http://localhost:%d', port);
}