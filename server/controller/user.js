const userDao = require('../daos/user')
const crypto = require('crypto')

const makeSalt = () => Math.round((new Date().valueOf() * Math.random())) + '';//generate salt
const encryptPass = (pass, salt) => crypto.createHash('md5').update(pass + salt).digest('hex');// generate md5

exports.sign = async function (ctx, next) {
    ctx.render('sign.html');
};

/**
 * user login
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.login = async (ctx, next) => {
	const { email, password } = ctx.request.body;
	const users = await userDao.query({ email });
	let ret = { code: -1, msg: 'error' };

	if (!users.length) {
		ret.code = 1;
		ret.msg = '用户不存在';
	} else {
		if (user[0].hash_password !== encryptPass(password, user[0].salt)) {
			ret.code = 2;
			ret.msg = '密码错误';
		} else {
			ctx.sign({ uid: users[0].id, uname: users[0].name });
			ret.code = 0;
			ret.msg = '登录成功';
		}
	}
	ctx.body = ret;
};

/**
 * user register
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.register = async (ctx, next) => {
	let form = ctx.request.body;
	form.salt = makeSalt();
	form.hash_password = encryptPass(form.password, form.salt);
	delete form.password;

	let ret = await userDao.insert(form);
	ctx.sign({ uid: ret.insertId, uname: form.name }); //注册成功后立即登陆
	ctx.body = {
		code: 0,
		msg: '注册成功！',
		data: ret
	}
};

/**
 * user logout
 * 注销
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.logout = async function (ctx, next) {
	ctx.state.token = null;
	ctx.sign({ name: 'logout' }, 1);
	ctx.body = {
		code: 0,
		msg: '注销成功'
	}
};