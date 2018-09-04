const mysql = require('mysql');

// https://dev.mysql.com/doc/dev/connector-nodejs/8.0/
/*
	8.0 버전 계정 보안 이슈 
	https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
*/
let mysqlWrapper = {
	mysql : mysql
	, conn : {
		host : '127.0.0.1'
		, user : 'mono'
		, password : '1234'
		, database : 'micronode'
		, multipleStatements: true	// 기본은 false 이고 한번에 하나의 쿼리만 수행함. true 로 전환시 복수 쿼리 수행가능
	}
	, getConnection : function () {
		let connection = this.mysql.createConnection(this.conn);
		connection.connect();
		return connection;
	}
}

// export default mysqlWrapper;
module.exports = mysqlWrapper;