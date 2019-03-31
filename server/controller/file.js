const { port } = require('../config/app')
const fs = require('fs')
const path = require('path')

/**
 * upload image
 * 上传图片
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.uploadFile = async (ctx, next) => {
	const form = ctx.request.body;
	const { dir, name, ext } = path.parse(form.name);
	const fileName = dir + '/' + name + new Date().getTime();
	const filePath = path.normalize(__dirname + '/../..') + "/public/upload/" + fileName + ext;
	const base64Data = form.data.replace(/^data:image\/\w+;base64,/, "");
	const dataBuffer = Buffer.from(base64Data, 'base64');
	fs.writeFileSync(filePath, dataBuffer);
	ctx.body = {
		code: 0,
		data: `http://localhost:${port}/upload${fileName + ext}`,
		message: 'success'
	};
}