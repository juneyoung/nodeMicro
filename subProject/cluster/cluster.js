const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length; // OS CPU 의 갯수
const port = 8000;

if (cluster.isMaster) {
	console.log(`Master ${process.pid} is running`);

	for(let i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', (worker, code, signal) => {
		console.log(`Worker ${ worker.process.pid } died`);
	})
} else {
	http.createServer((req, res) => {
		res.writeHead(200);
		res.end('Hello world!\n');
	}).listen(port);

	console.log(`Worker ${ process.pid } started`);
}