import { app } from '../config'
import fs from 'fs'
import path from 'path'
import http from 'http'
// import { htmlDecode } from '../common/util'
// import log from '../common/logger'
import { Context } from 'koa';

/**
 * upload image
 * 上传图片
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
export const uploadFile = async (ctx: Context) => {
	const form = ctx.request.body;
	const { dir, name, ext } = path.parse(form.name);
	const fileName = dir + '/' + name + new Date().getTime();
	const filePath = path.normalize(__dirname + '/../..') + "/public/upload/" + fileName + ext;
	const base64Data = form.data.replace(/^data:image\/\w+;base64,/, "");
	const dataBuffer = Buffer.from(base64Data, 'base64');
	fs.writeFileSync(filePath, dataBuffer);
	ctx.body = {
		code: 0,
		data: `http://localhost:${app.port}/upload${fileName + ext}`,
		message: 'success'
	};
}

/**
 * download markdown file
 * 下载 markdown
 * @param  {[type]}   ctx  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
// export const downloadFile = async (ctx: Context) => {
// 	let articleId = ctx.query.id;
// 	if (!articleId) return;
// 	try {
// 		let [article] = await articleDao.getArticleById(articleId);
// 		if (article) {
// 			article.content = htmlDecode(article.content);
// 		}
// 		ctx.attachment(article.title + '.md');
// 		ctx.body = article.content;
// 	} catch (err) {
// 		log.error(err);
// 		ctx.attachment('error.md');
// 		ctx.body = err.message;
// 	}
// }

/**
 * 批量下载网络文件到本地文件夹
 */
export const downLoad = async (ctx: Context) => {
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
function downLoadRemote(fileName: string, src: string) {
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