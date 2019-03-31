/**
 * mysql database config
 * @type {Object}
 */
module.exports={
	host: "localhost",
	port: "3306",
	user: "root",
	password: "jianfeng",
	database: "chatdb",
	charset : 'utf8mb4',//utf8mb4才能保存emoji
	multipleStatements: true,// 可同时查询多条语句, 但不能参数化传值
	connectionLimit: 100
};