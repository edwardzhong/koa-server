let helper = require('./daoHelper');

const methods={
    query:null,
    create:'insert into comment set create_date=unix_timestamp(now()), ?',
    getById: 'select * from comment where id = ?',
    getByArticleId:'select * from comment where article_id=?'
};

module.exports=helper.createMethod(methods);