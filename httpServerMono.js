let http = require('http');
let url = require('url');
let querystring = require('querystring');
let port = 8000;

// routings
const memberRouter = require('./routes/memberRouter');
const goodsRouter = require('./routes/goodsRouter');
const purchaseRouter = require('./routes/purchaseRouter');

let server = http.createServer((req, res) => {
	let method = req.method;
	let uri = url.parse(req.url, true);
	let pathname = uri.pathname;

	if (method === 'POST' || method === 'PUT') {
		let body = '';

		req.on('data', (chunk) => {
			body += chunk;
		});

		req.on('end', function(){
			console.log('path');
			let params;
			if (req.headers['content-type'] == 'application/json') {
				params = JSON.parse(body);
			} else {
				params = querystring.parse(body);
			}

			onRequest(res, method, pathname, params);
		});
	} else {
		onRequest(res, method, pathname, uri.query);
	}
}).listen(port);
console.log('=== Executing server on ', port);

let onRequest = function (res, method, pathname, params){
	let filteredPathname = pathname.startsWith('/') ? pathname.substring(1, pathname.length) : pathname;
	switch(filteredPathname) {
		case 'members':
			memberRouter.onRequest(res, method, pathname, params, response);
			break;

		case 'goods':
			goodsRouter.onRequest(res, method, pathname, params, response);
			break;

		case 'purchase':
			purchaseRouter.onRequest(res, method, pathname, params, response);
			break;

		default:
			res.writeHead(404);
			return res.end();
	}
}

/*
	let 으로 설정할 경우, 아래와 같은 오류 발생 
	TypeError [ERR_INVALID_ARG_TYPE]: The first argument must be one of type string or Buffer
*/
// let response = function (res, packet) {
// 	console.log('in response function in server.js', arguments);
// 	res.write(200, { 'Content-Type': 'application/json' });
// 	res.end(JSON.stringify(packet));
// }

function response(res, packet) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(packet));
}