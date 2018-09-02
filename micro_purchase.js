'use strict';

let delimeter = '|';
let business = require('./routes/purchaseRouter.js');

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
		console.log('onRead Members MicroService ', socket.remoteAddress, socket.remotePort, data);

		business.onRequest(socket, data.method, data.uri, data.params, (s, packet) => {
			socket.write(JSON.stringify(packet) + delimeter);
		});
	}
}

new purchases();