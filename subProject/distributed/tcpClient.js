'use strict';
/*
	TCP 서버 기반 
	- 접속 종료 이벤트를 얻을 수 있음 
*/

const net = require('net');
const delimeter = '|';

class tcpClient {
	constructor (host, port, onCreate, onRead, onEnd, onError) {
		this.options = {
			host : host
			, port : port
		}
		this.onCreate = onCreate;
		this.onRead = onRead;
		this.onEnd = onEnd;
		this.onError = onError;
	}
}

tcpClient.prototype.connect = function () {
	this.client = net.connect(this.options, () => {
		if(this.onCreate) this.onCreate(options);
	});

	// data 이벤트 정의
	this.client.on('data', (data) => {
		let sz = this.merge ? this.merge + data.toString() : data.toString();
		let arr = sz.split(delimeter);

		for(let n in arr) {
			if(sz.charAt(sz.length - 1) != delimeter && n == arr.length -1 ) {
				this.merge = arr[n];
				break;
			} else if (arr[n] == '') {
				break;
			} else {
				this.onRead(this.options, JSON.parse(arr[n]));
			}
		} 
	});

	this.client.on('close', () => {
		if(this.onEnd) this.onEnd(this.options);
	});

	this.client.on('error', (err) => {
		if(this.onError) this.onError(this.options, err);
	})
}


tcpClient.prototype.write = function (packet) {
	if(this.client) this.client.write(JSON.stringify(packet) + delimeter);
	else console.error('tcpClient write error', packet);
}


module.exports = tcpClient;