const exportFunctions = require('./daoHelper');

module.exports = exportFunctions({
    getTagsByUser: 'select a.name,b.* from tag a join tag_article b on a.id=b.tag_id where b.user_id = ?',
    getTagsByArticleId: 'select a.*,b.article_id from tag a join tag_article b on a.id=b.tag_id where b.article_id in (?)',
    addTag: 'insert into tag (name)values(?)',
    deleteTag: 'delete from tag where id=?',
    deleteEmptyTag: 'delete from tag where id not in (SELECT tag_id from tag_article)',
    addTagArticle: 'insert into tag_article (user_id,article_id,tag_id)values(?,?,?)',
    deleteTagArticle: 'delete from tag_article where user_id=? and article_id=? and tag_id=?',
    deleteTagArticleByArticleId: 'delete from tag_article where user_id=? and article_id=?'
});