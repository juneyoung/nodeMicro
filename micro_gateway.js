const http = require('http');
const url = require('url');
const querystring = require('querystring');
const port = 8000;
const tcpClient = require('./subProject/distributed/tcpClient.js');

/*
	분산 자원 관리용
*/
let mapClients = {};
let mapUrls = {};
let mapResponse = {};
let mapRR = {}; // Round Robin
let index =0;


let server = http.createServer((req, res) => {

	let method = req.method.toString().toLowerCase();
	let uri = url.parse(req.url, true);
	let pathname = uri.pathname;

	console.log('micro gateway method : ', method, ', pathname : ', pathname);

	if(method == 'put' || method == 'post') {
		let body = ''

		req.on('data', (data) => {
			body += data;
		});

		req.on('end', function () {
			let params = null;
			if(req.headers['content-type'] == 'application/json') {
				params = JSON.parse(body);
			} else {
				params = querystring.parse(body);
			}
			onRequest(res, method, pathname, params);
		});
		
	} else {
		onRequest(res, method, pathname, uri.query);
	}

})

server.listen(port, () => {
	console.log('LISTEN ', server.address());

	/*
		오오오오오
	*/

	let packet = {
		uri : '/distributes'
		, method : 'POST'
		, key : 0
		, params: {
			port: 8000
			, name : 'gate'
			,urls: []
		}
	}

	let isConnectedDistributor = false;

	this.clientDistributor = new tcpClient(
		'127.0.0.1'
		, 9000
		, (options) => {
			isConnectedDistributor = true;
			this.clientDistributor.write(packet);
		}
		, (options, data) => {
			onDistribute(data);
		}
		, (options) => { isConnectedDistributor = false; }
		, (options) => { isConnectedDistributor = false; }
	);

	setInterval(() => {
		if(!isConnectedDistributor) {
			this.clientDistributor.connect();
		}
	}, 3000);
});


function onDistribute (data) {
	console.log('onDistribute Event data :', data);
	for(let n in data.params) {
		let node = data.params[n];
		let key = node.host + ':' + node.port;	

		if(!mapClients[key] && node.name !== 'gate') {
			let client = new tcpClient(node.host, node.port, onCreateClient, onReadClient, onEndClient, onErrorClient);

			mapClients[key] = {
				client : client
				, info : node
			};

			for(var m in node.urls) {
				let urlKey = node.urls[m];
				if(!mapUrls[urlKey]) mapUrls[key] = [];
				mapUrls[urlKey].push(client);
			}

			console.log('After onDistribute Event ', mapUrls);

			client.connect();
		}
	}
}

function onCreateClient (options) {
	console.log('onCreateClient');
}


function onReadClient (options, packet) {
	console.log('onReadClient ', packet);
	mapResponse[packet.key].writeHead(200, { 'Content-Type' : 'application/json' });
	mapResponse[packet.key].end(JSON.stringify(packet));
	delete mapResponse[packet.key]; // 리스폰스 처리하고 지움 
}

function onEndClient (options) {
	let key = options.host + ':' + options.port;
	console.log('onEndClient', mapClients[key]);

	for(let n in mapClients[key].info.urls) {
		let node = mapClients[key].info.urls[n];
		delete mapUrls[node];
	}
	delete mapClients[key];
}

function onErrorClient (options) {
	console.log('onErrorClient');
}

function onRequest (res, method, pathname, params) {

	console.log('gateway onRequest');

	let key = method + pathname;	// POST/members
	let client = mapUrls[key];

	console.log('gateway onRequest', key, client);
	if (!client) {
		res.writeHead(404);
		res.end();
		return;
	} else {
		params.key = index;
		let packet = {
			uri : pathname
			, method : method
			, params : params
		}

		console.log('onRequest in gateway params : ', params, ' , packet : ', packet);

		mapResponse[index] = res;
		index++;

		if(!mapRR[key]) {
			mapRR[key] = 0;
		}
		mapRR[key]++;
		client[mapRR[key] % client.length].write(packet); // ??? RR 에 대한 조사 필요 
	}
}