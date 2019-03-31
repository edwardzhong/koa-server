create database if not exists chatdb;
use chatdb;

drop table if exists `user`;
CREATE TABLE `user` (
  `id` char(36) NOT NULL DEFAULT '' COMMENT '主键',
  `name` varchar(50) DEFAULT NULL COMMENT '用户名',
  `num` int(8) DEFAULT NULL  COMMENT '用户号码',
  `salt` varchar(13) DEFAULT NULL COMMENT '加密的盐',
  `hash_password` varchar(64) DEFAULT NULL COMMENT '加密后的密码',
  `email` varchar(50) NOT NULL COMMENT 'email地址',
  `nick` varchar(50) DEFAULT NULL COMMENT '昵称',
  `avatar` varchar(200) DEFAULT NULL COMMENT '头像',
  `signature` varchar(200) DEFAULT NULL COMMENT '个性签名',
  `status` tinyint(1) DEFAULT 0 COMMENT '状态(0 离线 1 在线 2 隐身)',
  `is_admin` tinyint(1) DEFAULT 0 COMMENT '是否管理员',
  `is_block` tinyint(1) DEFAULT 0 COMMENT '是否禁用',
  `create_date` int(10) unsigned DEFAULT NULL COMMENT '注册时间',
  `update_date` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='用户表'; 

drop table if exists `group`;
CREATE TABLE `group` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `avatar` varchar(200) DEFAULT NULL COMMENT '群图像',
  `name` varchar(20) NOT NULL COMMENT '组名',
  `desc` varchar(200) DEFAULT NULL COMMENT '介绍',
  `create_id` char(36) NOT NULL COMMENT '群主id',
  `create_date` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `update_date` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='群组表';

drop table if exists `message`;
CREATE TABLE `message` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `content` text NOT NULL COMMENT '内容',
  `type` tinyint(1) DEFAULT 0 COMMENT '类型(0 用户 1 组群)',
  `send_id` char(36) NOT NULL COMMENT '发送用户id',
  `receive_id` char(36) DEFAULT NULL COMMENT '接收用户id',
  `group_id` int(11) DEFAULT NULL COMMENT '组id',
  `create_date` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='消息表';

drop table if exists `apply`;
CREATE TABLE `apply` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `from_id` char(36) NOT NULL COMMENT '申请方id',
  `to_id` char(36) NOT NULL COMMENT '接受方id',
  `group_id` int(11) DEFAULT NULL COMMENT '组id',
  `type` tinyint(1) DEFAULT 0 COMMENT '类型(0 用户 1 组群)',
  `status` tinyint(1) DEFAULT 0 COMMENT '状态(0 待处理  1 已同意 2 已拒绝)',
  `apply_message` varchar(200) DEFAULT NULL COMMENT '附加消息',
  `reply` varchar(200) DEFAULT NULL COMMENT '回复消息',
  `create_date` int(10) unsigned DEFAULT NULL COMMENT '创建时间',
  `update_date` int(10) unsigned DEFAULT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='申请表';

drop table if exists `user_friend`;
CREATE TABLE `user_friend` (
  `user_id` char(36) NOT NULL COMMENT '用户id',
  `friend_id` char(36) NOT NULL COMMENT '好友id',
  PRIMARY KEY (`user_id`,`friend_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户好友连接表';

drop table if exists `user_group`;
CREATE TABLE `user_group` (
  `user_id` char(36) NOT NULL COMMENT '用户id',
  `group_id` int(11) NOT NULL COMMENT '组id',
  PRIMARY KEY (`user_id`,`group_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户组群连接表';

drop table if exists `user_message`;
CREATE TABLE `user_message` (
  `user_id` char(36) DEFAULT NULL COMMENT '接收用户id',
  `group_id` int(11) DEFAULT NULL COMMENT '接收群组id',
  `send_id` char(36) NOT NULL COMMENT '发送用户id',
  `message_id` int(11) NOT NULL COMMENT '消息id',
  `is_read` tinyint(1) DEFAULT 0 COMMENT '是否读过(0 没有 1 读过)',
  PRIMARY KEY (`send_id`,`message_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户消息连接表';

/* 触发器 和 存储过程 */
drop trigger if exists `user_insert`; 
drop trigger if exists `user_update`; 
drop trigger if exists `group_insert`; 
drop trigger if exists `group_update`; 
drop trigger if exists `message_insert`; 
drop trigger if exists `apply_insert`; 
drop trigger if exists `apply_update`; 
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
if (new.id = '' or new.id is null)
	then set new.id = uuid();
end if;
if (new.num = 0 or new.num is null)
	then set new.num = 1000;
end if;
if (new.`create_date` = 0 or new.`create_date` is null)
	then set new.`create_date` = unix_timestamp(now());
end if;
if (new.`update_date` = 0 or new.`update_date` is null)
	then set new.`update_date` = unix_timestamp(now());
end if;
END
$$

-- user表update触发器
delimiter $$
create trigger `user_update` before update on `user`
for each ROW
begin
if ((new.`name` <> old.`name`) or (new.`name` is not null and old.`name` is null) 
	or (new.`email` <> old.`email`) or (new.`email` is not null and old.`email` is null)
	or (new.`nick` <> old.`nick`) or (new.`nick` is not null and old.`nick` is null)
	or (new.`avatar` <> old.`avatar`) or (new.`avatar` is not null and old.`avatar` is null)
	or (new.`signature` <> old.`signature`) or (new.`signature` is not null and old.`signature` is null))
	then set new.`update_date` = unix_timestamp(now());
end if;
END
$$

-- group表insert触发器
delimiter $$
create trigger `group_insert` before insert on `group`
for each ROW
begin
if (new.`create_date` = 0 or new.`create_date` is null)
	then set new.`create_date` = unix_timestamp(now());
end if;
if (new.`update_date` = 0 or new.`update_date` is null)
	then set new.`update_date` = unix_timestamp(now());
end if;
END
$$

-- group表update触发器
delimiter $$
create trigger `group_update` before update on `group`
for each ROW
begin
if ((new.`avatar` <> old.`avatar`) or (new.`avatar` is not null and old.`avatar` is null) 
	or (new.`name` <> old.`name`) or (new.`name` is not null and old.`name` is null)
	or (new.`desc` <> old.`desc`) or (new.`desc` is not null and old.`desc` is null))
	then set new.`update_date` = unix_timestamp(now());
end if;
END
$$

-- message表insert触发器
delimiter $$
create trigger `message_insert` before insert on `message`
for each ROW
begin
if (new.`create_date` = 0 or new.`create_date` is null)
	then set new.`create_date` = unix_timestamp(now());
end if;
END
$$

-- apply表insert触发器
delimiter $$
create trigger `apply_insert` before insert on `apply`
for each ROW
begin
if (new.`create_date` = 0 or new.`create_date` is null)
	then set new.`create_date` = unix_timestamp(now());
end if;
if (new.`update_date` = 0 or new.`update_date` is null)
	then set new.`update_date` = unix_timestamp(now());
end if;
END
$$

-- apply表update触发器
delimiter $$
create trigger `apply_update` before update on `apply`
for each ROW
begin
if ((new.`status` <> old.`status`) or (new.`status` is not null and old.`status` is null) 
	or (new.`reply` <> old.`reply`) or (new.`reply` is not null and old.`reply` is null))
	then set new.`update_date` = unix_timestamp(now());
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

-- select a.id,a.content,a.type,a.send_id,b.user_id,b.is_read, FROM_UNIXTIME(a.create_date, \'%Y/%m/%d %h:%m:%s\')create_date from message a join user_message b on a.id = b.message_id where a.send_id in (1,2) and b.user_id in (1,2)