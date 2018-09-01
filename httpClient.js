let http = require('http');
let options = {
	host : '127.0.0.1'
	, port : 8000
	, path : '/'
}

let request = http.request(options, (res) => {
	let data = '';
	res.on('data', (chunk) => {
		data += chunk;
	});

	res.on('end', () => {
		console.log('response end event :: ',data);
	})
});

request.end();