const mysqlWrapper = require('../dataAccess/mysqlWrapper');
const redisWrapper = require('../dataAccess/redisWrapper');


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
		// Before Redis cache
		// conn.query(
		// 	'insert into goods (name, category, price, description) values (?, ?, ?, ?)'
		// 	, [ params.name , params.category, params.price, params.description ]
		// 	, (error, results, fields) => {
		// 		console.log('Mysql register Callback result ', arguments);
		// 		if(error) {
		// 			response.errorcode = 1;
		// 			response.errormessage = error;
		// 		}
		// 		cb(response);
		// 	});


		conn.query(
			'insert into goods (name, category, price, description) values (?, ?, ?, ?); select LAST_INSERT_ID() as id;'
			, [ params.name , params.category, params.price, params.description ]
			, (error, results, fields) => {
				// console.log('Mysql register Callback result ', arguments);
				if(error) {
					response.errorcode = 1;
					response.errormessage = error;
				} else {
					// DB 에 넣었으면 캐시에도 넣는다 
					console.log('Goods Logic results :: ', results);
					const id =results[1][0].id;
					console.log('Insert Goods to Redis Cache id :: ', id, ', data : ', JSON.stringify(params));
					redisWrapper.set(id, JSON.stringify(params));
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
					console.log('Delete Goods from Redis Cache ', params.id);
					redisWrapper.del(params.id);	// Add Redis Cache
				}
				cb(response);
			});
		conn.end();
	}
}