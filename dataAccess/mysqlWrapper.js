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
	}
	, getConnection : function () {
		let connection = this.mysql.createConnection(this.conn);
		connection.connect();
		return connection;
	}
}

// export default mysqlWrapper;
module.exports = mysqlWrapper;