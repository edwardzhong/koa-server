const { index, msg } = require('./controller/index');
const { sign, login, register, logout } = require('./controller/user');

module.exports = function (router) {
    router.get('/', index)
        .get('/index', index)
        .get('/msg', info)
        .get('/sign', sign)
        .get('/login', login)
        .get('/logout', logout)
        .get('/register', register)
};
