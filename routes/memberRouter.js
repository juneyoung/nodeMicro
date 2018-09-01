const mysqlWrapper = require('../dataAccess/mysqlWrapper');

exports.onRequest = function (res, method, pathname, params, cb) {
	console.log('Members router onRequest', arguments);
	switch(method.toLowerCase()) {
		case 'get' :
			return inquiry(method, pathname, params, (response) => {
				process.nextTick(cb, res, response);
			});
		case 'post' :
			return register(method, pathname, params, (response) => {
				process.nextTick(cb, res, response);
			});
		case 'delete' :
			return unregister(method, pathname, params, (response) => {
				process.nextTick(cb, res, response);
			});
		default:
			return process.nextTick(cb, res, null);
	}
}


function register(method, pathname, params, cb) {  
    let response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.username == null || params.password == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let conn = mysqlWrapper.getConnection();
        connection.query("insert into members(username, password) values('" + params.username + "',password('" + params.password + "'));", (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;                
            }
            cb(response);
        });
        connection.end();
    }
}

function inquiry(method, pathname, params, cb) {   
    let response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.username == null || params.password == null) {

        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let conn = mysqlWrapper.getConnection();
        conn.query("select id from  members where username = '" + params.username + "' and password = password('" + params.password +"');", (error, results, fields) => {
            if (error || results.length == 0) {
                response.errorcode = 1;
                response.errormessage = error ? error : "invalid password";
            } else {
                response.userid = results[0].id;
            }
            cb(response);
        });
        conn.end();
    }     
}

function unregister(method, pathname, params, cb) {
    let response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.username == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let conn = mysqlWrapper.getConnection(conn);
        conn.query("delete from  members where username = '" + params.username + "';", (error, results, fields) => {
            if (error) {
                response.errorcode = 1;
                response.errormessage = error;                
            }
            cb(response);
        });
        conn.end();
    }
}