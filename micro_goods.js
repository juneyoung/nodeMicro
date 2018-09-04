'use strict';

const delimeter = '|';
const business = require('./routes/goodsRouter.js');
const cluster = require('cluster');

class goods extends require('./subProject/distributed/tcpServer.js') {
	constructor () {
		// process.argv[n] 으로 가져오는 이유는 실행시 콘솔 전달값으로 처리하기 위해서 
		super('goods'
			, process.argv[2] ? Number(process.argv[2]) : 9010
			, ['POST/goods', 'GET/goods', 'DELETE/goods']);

		// distributor 의 포트는 9000 으로 고정되어 있음 
		this.connectToDistributor('127.0.0.1', 9000., (data) => {
			console.log('Distributor Notification Goods MicroService', data);
		})
	}


	onRead (socket, data) {
		console.log('onRead Goods MicroService ', socket.remoteAddress, socket.remotePort, data);
		business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
			socket.write(JSON.stringify(packet) + delimeter);
		});
	}
}

if(cluster.isMaster) {
	console.log(`Goods MicroService master process ${process.pid} is started. Fork 1 child process`);
	cluster.fork();	//자식 프로세스 생성
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Goods child process ${ worker.process.pid } died. Fork new one`);
		cluster.fork();
	});
} else {
	console.log(`Goods MicroService child process ${ process.pid } is stared`);
	new goods();	
}
