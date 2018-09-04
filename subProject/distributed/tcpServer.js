'use strict';

const net = require('net');
const tcpClient = require('./tcpClient.js');
const delimeter = '|';

class tcpServer {
	constructor (name, port, urls){
		this.logTcpClient = null;

		this.context = {
			port : port
			, name : name
			, urls : urls
		}

		this.merge = {};

		this.server = net.createServer((socket) => {
			this.onCreate(socket); // Client connect event handling 

			socket.on('error', (err) => {
				this.onClose(socket);
			});

			socket.on('close', () => {
				this.onClose(socket);
			});

			socket.on('data', (data) => {	// data recieving handler


				let key = socket.remoteAddress + ':' +socket.remotePort;
				let sz = this.merge[key] ? this.merge[key] + data.toString() : data.toString();
				let arr = sz.split(delimeter);

				for(let n in arr) {
					if(sz.charAt(sz.length - 1) != delimeter && arr.length -1 == n) {
						this.merge[key] = arr[n];
						break;
					} else if(arr[n] == '') {
						break;
					} else {
						this.writeLog(arr[n]);
						this.onRead(socket, JSON.parse(arr[n]));
					}

				}
			});
		});


		this.server.on('error', (error) => {
			console.error(error);
		})

		this.server.listen(port, () => {
			console.log('LISTEN ', this.server.address());
		})
	}

	onCreate (socket) {
		console.log('onCreate', socket.remoteAddress, socket.remotePort);
	}

	onClose (socket) {
		console.log('onClose', socket.remoteAddress, socket.remotePort);
	}

	connectToDistributor (host, port, onNoti) {
		let packet = {
			uri : '/distributes'
			, method : 'POST'
			, key : 0
			, params : this.context
		}

		let isConnectedDistributor = false;

		this.clientDistributor = new tcpClient (
			host, port
			// onCreate
			,  (options) => {
				isConnectedDistributor = true;
				this.clientDistributor.write(packet);
			}
			// onRead
			, (options, data) => {
				// Logging Client 추가 
				// context 에는 생성자에서 넣은 데이터가 있음 
				/*
					===== ONLY FOR LOGGING =====
				*/
				if(!this.logTcpClient && this.context.name != 'logs') {
					for(let n in data.params) {
						let microservice = data.params[n];
						if( microservice.name == 'logs') {
							this.connectToLog(microservice.host, microservice.port);
							break;
						}
					}
				}

				onNoti(data);
			}
			// onEnd
			, (options) => {
				isConnectedDistributor = false;
			}
			// onError
			, (options) => {
				isConnectedDistributor = false;
			}
		);

		setInterval(() => {
			if (!isConnectedDistributor) {
				this.clientDistributor.connect();
			}
		}, 3000);

	}


	connectToLog (host, port) {
		// 이벤트 수가 다른 것 같은데... onCreate, onRead, onEnd, onError
		this.logTcpClient = new tcpClient(
			host
			, port
			, (options) => {}								// onCreate
			, (options) => { this.logTcpClient = null; }	// onRead
			, (options) => { this.logTcpClient = null; }	// onEnd
		);
		this.logTcpClient.connect();
	}

	writeLog (log) {
		if (this.logTcpClient) {
			let packet = {
				uri : '/logs'
				, method : 'POST'
				, key : 0
				, params : log
			}
			this.logTcpClient.write(packet);
		} else {
			console.log('No logTcpClient found log : ', log);
		}
	}
}

module.exports = tcpServer;