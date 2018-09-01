'use strict';

const net = require('net');
const tcpClient = require('./tcpClient.js');
const delimeter = '|';

class tcpServer {
	constructor (name, port, urls){
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
				let sz = this.merge[key] ? this.merge[key] + data.toString() : this.toString();
				let arr = sz.split(delimeter);

				for(let n in arr) {
					if(sz.charAt(sz.length - 1) != delimeter && sz.length -1 == n) {
						this.merge[key] = arr[n];
						break;
					} else if(arr[n] == '') {
						break;
					} else {
						this.onRead(socket, JSON.parse(arr[n]));
					}
				}
			});
		});
	}

	onCreate (socket) {
		console.log('onCreate', socket.remoteAddress, socket.remotePort);
	}

	onClose (socket) {
		console.log('onClose', socket.remoteAddress, socket.remotePort);
	}

	connetToDistributor (host, port, onNoti) {
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
}

module.exports = tcpServer;