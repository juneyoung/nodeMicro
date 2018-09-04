'use strict';

let delimeter = '|';
let business = require('./routes/purchaseRouter.js');
let cluster = require('cluster');

class purchases extends require('./subProject/distributed/tcpServer.js') {
	constructor () {
		super('purchases'
			, process.argv[2] ? Number(process.argv[2]) : 9030
			, [ 'POST/purchases', 'GET/purchases' ]);

		this.connectToDistributor('127.0.0.1', 9000, (data) => {
			console.log('Distributor Notification Purchases MicroService', data);
		});
	}

	onRead (socket, data) {
		console.log('onRead Purchases MicroService ', socket.remoteAddress, socket.remotePort, data);

		business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
			socket.write(JSON.stringify(packet) + delimeter);
		});
	}
}

if(cluster.isMaster) {
	console.log(`Purchases MicroService master process ${process.pid} is started. Fork 1 child process`);
	cluster.fork();
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Purchases child process ${ worker.process.pid } died. Fork new one`);
		cluster.fork();
	})
} else {
	console.log(`Purchases MicroService child process ${ process.pid } is stared`);
	new purchases();
}