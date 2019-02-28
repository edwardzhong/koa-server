const koa = require('koa')
const app = new koa()
const Pug = require('koa-pug')
const logger = require('koa-logger')
const server = require('koa-static')
const koaBody = require('koa-body')
const router = require('koa-router')()
const favicon = require('koa-favicon')
const addRouters = require('./router')
const config = require('./config/app')
const log = require('./common/logger')
const staticCache = require('koa-static-cache')
const compress = require('koa-compress')

const webpack = require('webpack');
const wpconfig = require('./webpack.dev.js');
const koaWebpack = require('koa-webpack');

const compiler = webpack(wpconfig);
(async () => {
    const middleware = await koaWebpack({
        compiler,
        devMiddleware: { publicPath: '/' }
    });
    app.use(middleware);
})()

//cache
app.use(staticCache(__dirname + '/public/lib'), {
    maxAge: 365 * 24 * 60 * 60
});

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
    formidable: { uploadDir: __dirname + '/public/upload' }
}));


// set static directiory
app.use(server(__dirname + '/dist'));
// favicon
app.use(favicon(__dirname + '/public/favicon.jpg'));

// set template engine
const pug = new Pug({
    viewPath: './view',
    debug: false,
    pretty: false,
    compileDebug: false,
    locals: { title: 'Koa Demo' },
    basedir: '/',
    app: app // equals to pug.use(app) and app.use(pug.middleware)
})
pug.locals.mode = 'develop';
// pug.use(app)

// add route
addRouters(router);
app.use(router.routes())
    .use(router.allowedMethods());

// koa already had middleware to deal with the error, rigister the error event
app.on('error', (err, ctx) => {
    log.error(err);
    ctx.status = 500;
    ctx.statusText = 'Internal Server Error';
    if (config.env === 'dev') { //throw the error to frontEnd when in the develop mode
        ctx.res.end(err.message); //finish the response
    } else {
        ctx.res.end('Server Error');
    }
});

// deal 404
app.use(async (ctx, next) => {
    ctx.status = 404;
    ctx.body = await ctx.render('404');
});

if (!module.parent) {
    let port = config.port || 3000;
    app.listen(port);
    log.info('=== app start ===');
    console.log('running server at: http://localhost:%d', port);
}
