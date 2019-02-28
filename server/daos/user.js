let helper = require('./daoHelper');

const methods={
	count:'select count(*) as count from user where ?',
	query:'select * from user where ?',
	insert:'insert into user set ?',
	update:'update user set ?',
	delete:'delete from user where ?'
};

module.exports=helper.createMethod(methods);