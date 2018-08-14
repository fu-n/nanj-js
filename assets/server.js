'use strict';

var config = require('../config');
var querystring = require('querystring');
var http = require('http')

module.exports = class {
	constructor(appId, secretKey) {
        this.appId = appId;
        this.secretKey = secretKey;
    }

	sentRelayTx(data, message) {
		let postData = querystring.stringify(data);
		var options = {
			host: config.nanj_host,
			port: 80,
			path: config.path_relay_tx,
			method: 'POST',
			auth: config.basic_auth,
			headers: {
				'Client-ID':this.appId,
				'Secret-Key':this.secretKey,
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(postData)
			}
		};

		return new Promise((resolve, reject) => {
		    var postHTTP = http.request(options, function(response) {
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					var objectData = JSON.parse(chunk);

					if (response.statusCode == 200) {
						resolve(objectData)
					}

					return reject(objectData)
				});
			})

			// post the data
			postHTTP.write(postData);
            postHTTP.end();
	    })
	}

	relayNonce(data) {
		let postData = querystring.stringify(data)

		var options = {
			host: config.nanj_host,
			port: 80,
			path: config.path_relay_nonce+'?'+postData,
			method: 'GET',
			auth: config.basic_auth,
			headers: {
				'Client-ID':this.appId,
				'Secret-Key':this.secretKey
			}
		};

		return new Promise((resolve, reject) => {
		    var postHTTP = http.request(options, function(response) {
				response.setEncoding('utf8');
				response.on('data', function (chunk) {
					var objectData = JSON.parse(chunk);
					if (response.statusCode == 200) {
						resolve(objectData)
					}

					return reject(objectData)
				});
			}).end();
	    })

	}
};