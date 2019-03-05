const http = require('http');
const qs = require('querystring');

/**
 * http get
 * @param  {String} url 
 * @param  {Object} form 
 */
function get(url, form) {
    return new Promise((resolve, reject) => {
        let body = '';
        http.get(url + '?' + qs.stringify(form), res => {
            res.setEncoding('utf8');
            res.on('data', data => {
                body += data;
            });

            res.on('end', () => {
                resolve(body);
            }).on('error', err => {
                reject(err)
            });
        });
    });
}

/**
 * http request post
 * @param  {Object} form 
 */
function request(opt, form) {
    let postData = qs.stringify(form),
        options = {
            hostname: '127.0.0.1',
            port: 80,
            path: opt.path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)//post必须加这个
            }
        },
        body = '';

    return new Promise((resolve, reject) => {
        let req = http.request(options, res => {
            res.setEncoding('utf8');
            res.on('data', chunk => {
                body += chunk;
            });
            res.on('end', () => {
                let firstCode = body.charCodeAt(0);//限定返回json格式,即第一个字符为"{"
                if (firstCode != 123) {
                    reject(new Error('server return unexpect data: ' + body));
                }
                resolve(body);
            });
        });

        req.on('error', err => {
            reject(err)
        });

        // post form
        req.write(postData);
        req.end();
    });
}

module.exports = {
    get,
    request
}