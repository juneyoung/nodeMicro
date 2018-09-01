const mysqlWrapper = require('../dataAccess/mysqlWrapper');


exports.onRequest = function (res, method, pathname, params, cb) {
	console.log('Goods router onRequest'/*, arguments*/);
	switch(method.toLowerCase()) {
		case 'get' :
			return inquiry (method, pathname, params, (response) => {
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
	console.log('register', params.name);
	let response = {
		key : params.key
		, errorcode : 0
		, errormessage : 'success'
	}

	if(!params.name || !params.category || !params.price) {
		console.log(1);
		response.errorcode = 1;
		response.errormessage = 'Invalid parameters';
		cb(response);
	} else {
		console.log(2);
		let conn = mysqlWrapper.getConnection();
		console.log('register conn', conn);
		conn.query(
			'insert into goods (name, category, price, description) values (?, ?, ?, ?)'
			, [ params.name , params.category, params.price, params.description ]
			, (error, results, fields) => {
				console.log('Mysql register Callback result ', arguments);
				if(error) {
					response.errorcode = 1;
					response.errormessage = error;
				}
				cb(response);
			});
		conn.end();
	}
}


function inquiry (method, pathname, params, cb) {
	let response = {
		key : params.key
		, errorcode : 0
		, errormessage : 'success'
	}
	let conn = mysqlWrapper.getConnection();
	conn.query('select * from goods'
		, (error, results, fields) => {
			console.log('Mysql Inquiry Callback result ', arguments);
			if(error) {
				response.errorcode = 1;
				response.errormessage = error;
			} else {
				response.results = results || [];
			}
			cb(response);
		});
	conn.end();
}


function unregister (method, pathname, params, cb) {
	let response = {
		key : params.key
		, errorcode : 0
		, errormessage : 'success'
	}

	if(!params.id) {
		response.errorcode = 1;
		response.errormessage = 'Invalid parameters';
		cb(response);
	} else {
		let conn = mysqlWrapper.getConnection();
		conn.query('delete from goods where id = ?'
			, [ params.id ]
			, (error, results, fields) => {
				if(error) {
					response.errorcode = 1;
					response.errormessage = error;
				} else {
					response.results = results || [];
				}
				cb(response);
			});
		conn.end();
	}
}