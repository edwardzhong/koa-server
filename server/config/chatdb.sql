create database if not exists chatdb;
use chatdb;

drop table if exists `user`;
CREATE TABLE `user` (
  `id` char(36) NOT NULL DEFAULT '' COMMENT '主键',
  `name` varchar(50) NOT NULL COMMENT '用户名',
  `salt` varchar(13) DEFAULT NULL COMMENT '加密的盐',
  `hash_password` varchar(64) DEFAULT NULL COMMENT '加密后的密码',
  `email` varchar(50) DEFAULT NULL COMMENT 'email地址',
  `nick` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(50) DEFAULT NULL COMMENT '头像',
  `signature` varchar(100) DEFAULT NULL COMMENT '个性签名',
  `is_admin` tinyint(1) DEFAULT '0' COMMENT '是否管理员',
  `is_block` tinyint(1) DEFAULT '0' COMMENT '是否禁用',
  `create_date` int(10) unsigned DEFAULT NULL COMMENT '注册时间',
  `update_date` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 comment '用户表';

drop table if exists `article`;
create table `article`(
`id` int not null auto_increment primary key comment '主键',
`title` varchar(100) comment '标题',
`content` text comment '内容',
`author_id` char(36) not null comment '作者id',
`is_good` tinyint(1) default 0 comment '是否精品',
`is_top` tinyint(1) default 0 comment '是否置顶',
`create_date` int unsigned comment '创建时间',
`update_date` int unsigned comment '更新时间'
) comment '文章表';

drop table if exists `tag`;
create table `tag`(
`id` int not null auto_increment primary key comment '主键',
`name` varchar(20) not null comment '标签名称'
) comment '标签表';

drop table if exists `message`;
create table `message`(
`id` int not null auto_increment primary key comment '主键',
`content` varchar(100) not null comment '内容',
`type` tinyint(1) default 0 comment '类型',
`user_id` char(36) NOT NULL COMMENT '用户id',
`topic_id` int comment '主题id',
`reply_id` int comment '回复id',
`is_read` tinyint(1) default 0 comment '是否已经读过',
`create_date` int unsigned comment '创建时间'
) comment '消息表';

drop table if exists `tag_article`;
CREATE TABLE `tag_article` (
  `user_id` char(36) NOT NULL COMMENT '用户id',
  `article_id` int NOT NULL COMMENT '文章id',
  `tag_id` int NOT NULL COMMENT '标签id',
  PRIMARY KEY (`user_id`,`article_id`,`tag_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='标签文章连接表'; 

/* 触发器 和 存储过程 */
drop trigger if exists `user_insert`; 
drop trigger if exists `user_update`; 
drop trigger if exists `article_insert`; 
drop trigger if exists `article_update`; 
drop procedure if exists `getpage`;

-- Do nothing, if appear 'ERROR 1064 (42000): ...', it's ok !
delimiter $$
# 创建触发器/存储过程的代码 与 其他命令块 相隔的地方会报错'ERROR 1064 (42000): ...', 所以这里出现空语句块，避免影响实际代码块
$$

-- user表insert触发器
delimiter $$
create trigger `user_insert` before insert on `user`
for each ROW
begin
if (new.id='' or new.id is null)
	then set new.id=uuid();
end if;
if (new.`create_date`=0 or new.`create_date` is null)
	then set new.`create_date`=unix_timestamp(now());
end if;
if (new.`update_date`=0 or new.`update_date` is null)
	then set new.`update_date`=unix_timestamp(now());
end if;
END
$$

-- user表update触发器
delimiter $$
create trigger `user_update` before update on `user`
for each ROW
begin
if ((new.`name`<>old.`name`) or (new.`name` is not null and old.`name` is null) 
	or (new.`email`<>old.`email`) or (new.`email` is not null and old.`email` is null)
	or (new.`nick`<>old.`nick`) or (new.`nick` is not null and old.`nick` is null)
	or (new.`avatar`<>old.`avatar`) or (new.`avatar` is not null and old.`avatar` is null)
	or (new.`signature`<>old.`signature`) or (new.`signature` is not null and old.`signature` is null))
	then set new.`update_date`=unix_timestamp(now());
end if;
END
$$

-- article表insert触发器
delimiter $$
create trigger `article_insert` before insert on `article`
for each ROW
begin
if (new.`create_date`=0 or new.`create_date` is null)
	then set new.`create_date`=unix_timestamp(now());
end if;
if (new.`update_date`=0 or new.`update_date` is null)
	then set new.`update_date`=unix_timestamp(now());
end if;
END
$$

-- article表update触发器
delimiter $$
create trigger `article_update` before update on `article`
for each ROW
begin
if ((new.`title`<>old.`title`) or (new.`title` is not null and old.`title` is null) 
	or (new.`content`<>old.`content`) or (new.`content` is not null and old.`content` is null))
then set new.`update_date`=unix_timestamp(now());
end if;
END
$$

-- 获取分页数据存储过程
delimiter $$
create procedure `getpage`
(
	in tb_name varchar(50),#表名
	in sql_where varchar(300), #where条件和order by
	in page_index int, #查询页数
	in page_size int, #分页大小
	out page_total int, #总的页数
	out rows_total int #总记录书
)
begin
	set @where ='';
	if page_index < 1 then set page_index = 1;end if;
	if page_size < 1 then set page_size = 1;end if;
	if (sql_where is not null and length(sql_where) > 0) 
		then set @where = concat(' where ',sql_where);
	end if;
	
	set @rowstart = (page_index - 1) * page_size;
	set @pgsize = page_size;
	set @sql = concat('select SQL_CALC_FOUND_ROWS* from ', tb_name, @where, ' limit ?,?');
	
	prepare sql_page from @sql; #准备好sql语句，以便传参执行
	execute sql_page using @rowstart, @pgsize; #执行sql
	deallocate prepare sql_page; #释放掉
	set rows_total = found_rows();
	set page_total = ceil(rows_total/page_size);
end
$$

-- call getpage('user','',1,2,@pages,@total) --调用存储过程的方式
-- select @pages,@total --获取返回参数的值

-- select a.*,b.article_id from tag a join tag_article b on a.id=b.tag_id where b.article_id in (4,5)
-- select * from article a join tag_article b on a.id=b.article_id where b.tag_id=2