import fs from 'fs'
import path from 'path'
import http from 'http'
import { Context } from 'koa';
import { post } from '../decorator/httpMethod';
import log from '../common/logger'

export default class FileHandle {
  /**
   * 上传formData
   * @param ctx Context
   * 参数格式{file:File}
   */
  @post('/upload')
  async uploadFile(ctx: Context) {
    const file = ctx.request.files.file;
    const dotPos = file.name.indexOf('.');
    const fileName = file.name.substr(0, dotPos) + new Date().getTime() + file.name.substr(dotPos);
    const filePath = "/usr/image/" + fileName;
    const stream = fs.createWriteStream(filePath);//创建可写流
    fs.createReadStream(file.path).pipe(stream);
    //删除file临时文件
    fs.unlink(file.path, err => {
      if (err) log.error(err)
    });
    ctx.body = {
      code: 0,
      data: `/image/${fileName}`,
      msg: 'success'
    }
  }

  /**
   * @param  {[type]}   ctx  [description]
   * 上传base64
   * 参数格式 {name:string;data:string}
   */
  async uploadBase64(ctx: Context) {
    const form = ctx.request.body;
    const { dir, name, ext } = path.parse(form.name);
    const fileName = dir + '/' + name + new Date().getTime() + ext;
    const filePath = "/usr/image/" + fileName;
    const base64Data = form.data.replace(/^data:image\/\w+;base64,/, "");
    const dataBuffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(filePath, dataBuffer);
    ctx.body = {
      code: 0,
      data: `/image/${fileName}`,
      msg: 'success'
    };
  }


  /**
   * 批量下载网络文件到本地文件夹
   */
  async downLoad(ctx: Context) {
    const form = ctx.request.body;
    const that = this
    for (let { k, v } of form) {
      that.downLoadRemote(k, v);
    }
    ctx.body = await {
      status: 0,
      msg: 'download success!'
    };
  }

  //下载网络文件到本地
  private downLoadRemote(fileName: string, src: string) {
    let imgData = "";
    const ext = path.extname(src);
    const dir = path.normalize(__dirname + '/../..');

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

  /**
   * download markdown file
   * 下载 markdown
   * @param  {[type]}   ctx  [description]
   */
  // async downloadFile(ctx: Context) {
  // 	let articleId = ctx.query.id;
  // 	if (!articleId) return;
  // 	let [article] = await articleDao.getArticleById(articleId);
  // 	if (article) {
  // 		article.content = htmlDecode(article.content);
  // 	}
  // 	ctx.attachment(article.title + '.md');
  // 	ctx.body = article.content;
  // }
}
