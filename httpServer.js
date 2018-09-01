let http = require('http');
let port = 8000;

let server = http.createServer((req, res) => {
	let method = req.method;	
	res.end('WTF...');
}).listen(port);

