const koa = require('koa')
const app = new koa()
const logger = require('koa-logger')
const log = require('./common/logger')
const static = require('koa-static')
const compress = require('koa-compress')
const cors = require('koa2-cors');
const koaBody = require('koa-body')
const router = require('koa-router')()
const favicon = require('koa-favicon')
const tpl = require('./middleware/tpl')
const jwt = require('./middleware/jwt')
const verify = require('./middleware/verify')
const addRouters = require('./router')
const config = require('./config/app')
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server)
const appSocket = require('./socket')
const path = require('path')
const baseDir = path.normalize(__dirname + '/..')

// gzip
app.use(compress({
    filter: function (content_type) {
        return /text|javascript/i.test(content_type)
    },
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
}));

// diplay access records
app.use(logger());

// session

// parse request
app.use(koaBody({
    jsonLimit: 1024 * 1024 * 5,
    formLimit: 1024 * 1024 * 5,
    textLimit: 1024 * 1024 * 5,
    multipart: true,// 解析FormData数据
    formidable: { uploadDir: path.join(baseDir, 'public/upload') }
}));

// set static directiory
app.use(static(path.join(baseDir, 'dist'), { index: false }));
app.use(favicon(path.join(baseDir, 'dist/favicon.jpg')));

//cors
app.use(cors({
    origin: 'http://localhost:4001',// * 仍然不能访问，要写明具体域名才行
    credentials: true,//是否将request的凭证暴露出来
    allowMethods: ['GET', 'POST', 'DELETE'],
    exposeHeaders: ['Authorization'],// expose出去，axios才能获取该字段
    allowHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

//json-web-token
app.use(jwt({
    secret: config.secret,
    exp: config.exp,
}));

// set template engine
app.use(tpl({
    path: baseDir + '/dist'
}));

app.use(verify([
    '/upload',
    '/userInfo',
    '/logout'
]));

// add route
addRouters(router);
app.use(router.routes())
    .use(router.allowedMethods());

// deal 404
app.use(async (ctx, next) => {
    log.error(`404 ${ctx.message} : ${ctx.href}`);
    ctx.status = 404;
    // ctx.body = '404! page not found !';
    ctx.render('404.html');
});

// koa already had middleware to deal with the error, just rigister the error event
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
    const { port, socketPort } = config;
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
    appSocket(io);
    server.listen(socketPort);
    log.info(`=== socket listening on port ${socketPort} ===`)
    console.log('socket server running at: http://localhost:%d', socketPort);
}