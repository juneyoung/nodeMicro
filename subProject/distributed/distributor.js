'use strict';

let map = {};
const delimeter = '|';

class distributor extends require('./tcpServer.js') {
	constructor(){
		super('distributor', 9000, [ "POST/distributors", "GET/distributors"]);
	}

	onCreate (socket) {
		console.log('onCreate', socket.remoteAddress, socket.remotePort);
		this.sendInfo(socket);
	}

	onClose (socket) {
		let key = socket.remoteAddress + ':' + socket.remotePort;
		console.log('onClose', key);
		if(map[key]) delete map[key];
		else console.error('Error could not find key ', key, ' in onClose event');
		this.sendInfo();
	}

	onRead (socket, json) {
		let key = socket.remoteAddress + ':' + socket.remotePort;
		console.log('onRead', key, json);

		if(json.uri == '/distributors' && json.method == 'POST') {
			// 등록
			map[key] = {
				socket : socket
			};
			map[key].info = json.params;

			// map[key]{socket, info} = { socket, json.params};
			map[key].info.host = socket.remoteAddress;
			this.sendInfo();
		}
	}


	write (socket, packet) {
		socket.write(JSON.stringify(packet) + delimeter);
	}

	sendInfo (socket) {
		let packet = {
			uri : '/distributors'
			, method : 'GET'
			, key : 0
			, params : []
		}

		for (var n in map) {
			packet.params.push(map[n].info);
		}

		if(socket) {
			this.write(socket, packet);
		} else {
			// ???
			for(let n in map) {
				this.write(map[n].socket, packet);
			}
		}
	}
}

new distributor();