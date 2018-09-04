/* 상품 */
CREATE TABLE IF NOT EXISTS `goods` (
  id int not null auto_increment primary key comment '상품 아이디'
  , name varchar(128) not null comment '상품명'
  , category varchar(128) not null comment '상품 카테고리'
  , price decimal(9,2) default 0 comment '상품 가격'
  , description text comment '상품 설명'
  , created datetime default now() comment '생성일'
  , changed datetime default now() comment '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX goods_name on goods(name);
CREATE INDEX goods_price on goods(price);
CREATE INDEX goods_created on goods(created);
CREATE INDEX goods_changed on goods(changed);

/* 회원 */
CREATE TABLE IF NOT EXISTS `members` (
  id int not null auto_increment primary key comment '회원 시퀀스'
  , userid varchar(128) not null comment '사용자 아이디'
  , username varchar(128) not null comment '사용자명'
  , password varchar(256) not null comment '비밀번호'
  , created datetime default now() comment '생성일'
  , changed datetime default now() comment '수정일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX members_userid on members(userid);
CREATE INDEX members_created on members(created);
CREATE INDEX members_changed on members(changed);

/* 구매이력 */
CREATE TABLE IF NOT EXISTS `purchases` (
  id int not null auto_increment primary key comment '구매이력 시퀀스'
  , userid varchar(128) not null comment '사용자 아이디'
  , goodsid int not null comment '상품 아이디'
  , created datetime default now() comment '구매일'
  , changed datetime default now() comment '변경일'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
CREATE INDEX purchases_userid on purchases(userid);
CREATE INDEX purchases_created on purchases(created);
CREATE INDEX purchases_changed on purchases(changed);

COMMIT;


SELECT * FROM goods;
