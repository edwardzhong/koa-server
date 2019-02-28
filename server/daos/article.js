let helper = require('./daoHelper');

const methods={
    query:null,
    getArticleByTagId:'select a.id,a.title,a.content,a.author_id,a.is_good,a.is_top,a.is_publish,a.is_delete,FROM_UNIXTIME(a.create_date, \'%Y/%m/%d %h:%m:%s\')create_date ,from_unixtime(a.update_date, \'%Y/%m/%d %h:%m:%s\')update_date from article a join tag_article b on a.id=b.article_id where b.tag_id=?',
    getArticleById:'select id,title,content,author_id,is_good,is_top,is_publish,is_delete,FROM_UNIXTIME(create_date, \'%Y/%m/%d %h:%m:%s\')create_date ,from_unixtime(update_date, \'%Y/%m/%d %h:%m:%s\')update_date from article where id=?',
    getArticleByUserId:'select id,title,content,author_id,is_good,is_top,is_publish,is_delete,FROM_UNIXTIME(create_date, \'%Y/%m/%d %h:%m:%s\')create_date ,from_unixtime(update_date, \'%Y/%m/%d %h:%m:%s\')update_date from article where author_id=? and is_delete=? order by update_date desc',
    save:'update article set update_date=unix_timestamp(now()),title=?,content=? where id=?',
    createNew:'insert into article set create_date=unix_timestamp(now()),update_date=unix_timestamp(now()), ?',
    setPublish:'update article set update_date=unix_timestamp(now()),is_publish=? where id=?',
    setDelete:'update article set update_date=unix_timestamp(now()),is_delete=? where id=?',
    realDelete:'delete from article where id=?'
};

module.exports=helper.createMethod(methods);