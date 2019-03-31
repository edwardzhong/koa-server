const { index } = require('./controller/user')
const { sign, login, register } = require('./controller/sign')
const { uploadFile } = require('./controller/file')

module.exports = function (router) {
    router.get('/', index)
        .get('/index', index)
        .get('/sign', sign)
        .post('/login', login)
        .post('/register', register)
        .post('/upload', uploadFile)
};
