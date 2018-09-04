'use strict';

let business = require('./routes/memberRouter.js');
const cluster = require('cluster');
let delimeter = '|';

class members extends require('./subProject/distributed/tcpServer.js') {
	constructor () {
		super('members'
			, process.argv[2] ? Number(process.argv[2]) : 9020
			, ['POST/members', 'GET/members', 'DELETE/members']
		);	

		this.connectToDistributor('127.0.0.1', 9000, (data) => {
			console.log('Distributor Notification Members MicroService', data);
		})
	}
	

	onRead (socket, data) {
		console.log('onRead Members MicroService ', socket.remoteAddress, socket.remotePort, data);
		business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
			socket.write(JSON.stringify(packet) + delimeter);
		});
	}
}


if(cluster.isMaster) {
	console.log(`Members MicroService master process ${process.pid} is started. Fork 1 child process`);
	cluster.fork();	//자식 프로세스 생성
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Members child process ${ worker.process.pid } died. Fork new one`);
		cluster.fork();
	});
} else {
	console.log(`Members MicroService child process ${ process.pid } is stared`);
	new members();	
}