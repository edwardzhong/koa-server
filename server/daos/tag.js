const helper = require('./daoHelper');
const pool = require("./dbPool").getPool();
const log = require('../common/logger').logger();

const methods = {
    getTagsByUser: 'select a.name,b.* from tag a join tag_article b on a.id=b.tag_id where b.user_id = ?',
    addTag: 'insert into tag (name)values(?)',
    deleteTag: 'delete from tag where id=?',
    deleteEmptyTag: 'delete from tag where id not in (SELECT tag_id from tag_article)',
    addTagArticle: 'insert into tag_article (user_id,article_id,tag_id)values(?,?,?)',
    deleteTagArticle: 'delete from tag_article where user_id=? and article_id=? and tag_id=?',
    deleteTagArticleByArticleId: 'delete from tag_article where user_id=? and article_id=?'
};

exports.getTagsByArticleId = function (ids) {
    return new Promise((resolve, reject) => {
        var sql = `select a.*,b.article_id from tag a join tag_article b on a.id=b.tag_id where b.article_id in (${ids})`;
        log.info('=== tagDao ===');
        log.info('sql:' + sql);
        pool.query(sql, (err, result, fields) => {
            if (err) reject(err)
            else resolve(result);
        });
    });
};

for (let [key, value] of Object.entries(methods)) {
    exports[key] = function (param) {
        return new Promise((resolve, reject) => {
            let callback = (err, result, fields) => {
                if (err) reject(err)
                else resolve(result);
            };
            log.info('=== tagDao ===');
            if (value) {
                log.info('sql:' + value);
                log.info('param:' + param);
                pool.query(value, param, callback);
            } else {
                log.info('sql:' + param);
                pool.query(param, callback);
            }
        });
    };
}