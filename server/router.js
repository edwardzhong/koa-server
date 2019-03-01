const { index, msg } = require('./controller/index');
const { sign, login, register, logout } = require('./controller/user');

module.exports = function (router) {
    router.get('/', index)
        .get('/index', index)
        .get('/msg', msg)
        .get('/sign', sign)
        .post('/login', login)
        .get('/logout', logout)
        .post('/register', register)
};
