'use strict';

const cluster = require('cluster');
const fs = require('fs');

// Elasticsearch
const es = new require('elasticsearch').Client({
	host: '127.0.0.1:9200'
	, log: 'trace'
})

class logs extends require('../distributed/tcpServer.js') {
	constructor () {
		//tcpServer 의 생성자 
		super('logs' 
			, process.argv[2] ? Number(process.argv[2]) : 9040
			, [ 'POST/logs' ]);

		//file writes - flags : append
		this.writestream = fs.createWriteStream('./logs/log.txt', { flags : 'a'})

		this.connectToDistributor('127.0.0.1', 9000, (data) => {
			console.log('Logs Microservice Distributor Notification', data);
		});		
	}

	onRead (socket, data) {
		const sz = new Date().toLocaleString() 
			+ '\t' + socket.remoteAddress 
			+ '\t' + socket.remotePort 
			+ '\t' + JSON.stringify(data) + '\n';

		console.log('Log Microservice onRead : ' + sz);
		this.writestream.write(sz);

		data.timestamp = new Date().toISOString();
		data.params = JSON.parse(data.params);
		es.index({
			index: 'microservice'
			, type: 'logs'
			, body: data
		})
	}
}

if(cluster.isMaster) {
	console.log(`Logs Microservice Master is running on ${process.pid}`);
	cluster.fork();
	cluster.on('exit', (worker, code, signal) => {
		console.log(`Logs Microservice Child ${worker.process.pid} died`);
		cluster.fork();
	});
} else {
	new logs();
}