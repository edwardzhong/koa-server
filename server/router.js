const { index, userInfo } = require('./controller/index')
const { sign, login, register, logout } = require('./controller/user')
const { uploadFile } = require('./controller/file')

module.exports = function (router) {
    router.get('/', index)
        .get('/index', index)
        .get('/userInfo', userInfo)
        .get('/sign', sign)
        .post('/login', login)
        .get('/logout', logout)
        .post('/register', register)
        .post('/upload', uploadFile)
};
