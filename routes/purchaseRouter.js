const mysqlWrapper = require('../dataAccess/mysqlWrapper');
const redisWrapper = require('../dataAccess/redisWrapper');

exports.onRequest = function (res, method, pathname, params, cb) {
	console.log('Purchase router onRequest', arguments);
	switch(method.toLowerCase()) {
		case 'get' :
			return inquiry(method, pathname, params, (response) => {
				process.nextTick(cb, res, response);
			});
		case 'post' :
			return register(method, pathname, params, (response) => {
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

    if (params.userid == null || params.goodsid == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {

        // 요청 상품 데이터를 레디스 캐시로 검증함 
        redisWrapper.get(params.goodsid, (err, result) => {
            response.errorcode = 1;
            response.errormessage = 'Redis failure';
            cb(response);
            return;
        })

        let conn = mysqlWrapper.getConnection();
        conn.query("insert into purchases(userid, goodsid) values(? ,? )"
            , [params.userid, params.goodsid]
            , (error, results, fields) => {
                if (error) {
                    response.errorcode = 1;
                    response.errormessage = error;                    
                } 
                cb(response);
            });
        conn.end();
    }
}

function inquiry(method, pathname, params, cb) {
    let response = {
        key: params.key,
        errorcode: 0,
        errormessage: "success"
    };

    if (params.userid == null) {
        response.errorcode = 1;
        response.errormessage = "Invalid Parameters";
        cb(response);
    } else {
        let conn = mysqlWrapper.getConnection();
        conn.query("select id, goodsid, date from purchases where userid = ?"
            , [params.userid]
            , (error, results, fields) => {
                if (error) {
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