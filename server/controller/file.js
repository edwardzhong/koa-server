const articleDao = require('../daos/article')
const util = require('../common/util')
const log = require('../common/logger').logger()
const fs = require('fs')
const http = require('http')
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
	try {
		//同步写入上传文件夹
		fs.writeFileSync(filePath, form.data, "binary", (err) => {
			if (err) { log.error(err); }
		});
		ctx.body = await {
			status: 0,
			src: '/upload/' + fileName + ext,
			ret: 'success'
		};
	} catch (err) {
		ctx.body = await {
			status: -1,
			error: err,
			msg: '系统错误'
		};
	}
};

/**
 * download markdown file
 * 下载 markdown
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
exports.downloadFile = async (ctx, next) => {
	let articleId = ctx.query.id;
	if (!articleId) return;
	try {
		let [article] = await articleDao.getArticleById(articleId);
		if (article) {
			article.content = util.htmlDecode(article.content);
		}
		ctx.attachment(article.title + '.md');
		ctx.body = article.content;
	} catch (err) {
		log.error(err);
		ctx.attachment('error.md');
		ctx.body = err.message;
	}
}

/**
 * 批量下载网络文件到本地文件夹
 */
exports.downLoad = async (ctx, next) => {
	let form = ctx.request.body;
	for (let { k, v } of form) {
		downLoadRemote(k, v);
	}
	ctx.body = await {
		status: 0,
		msg: 'download success!'
	};
}
//下载网络文件到本地
function downLoadRemote(fileName, src) {
	var imgData = "",
		ext = path.extname(src),
		dir = path.normalize(__dirname + '/../..');

	http.get(src, (res) => {
		res.setEncoding("binary"); //一定要设置response的编码为binary否则下载下来的文件打不开
		res.on("data", (chunk) => {
			imgData += chunk;
		});

		res.on("end", () => {
			//必须使用绝对路径
			fs.writeFile(dir + "/public/download/" + fileName + ext, imgData, "binary", (err) => {
				console.log("%s download %s", fileName, err ? "fail" : "success");
			});
		});
	});
}