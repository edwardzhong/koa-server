## 全栈多页面项目模版
* node 
* koa2
* pug 模版引擎
* json web token 认证
* mysql 数据库
* webpack 4

### 安装
```bash
npm install
```

### 运行
```bash
npm start          # develop front end
npm run build      # build front end

npm run dev:server # develop server
npm run server     # run server
```

### 配置文件
* config/app.js     -- app config
* config/log4js.js  -- log4js config
* process.json      -- pm2 config
* webpack.dev.js    -- webpack development
* webpack.prod.js   -- webpack production
* .babelrc          -- babel config

