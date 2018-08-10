'use strict';

require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT || 8088;
const path = require('path')

var server = app.listen(port, () => {
	var host = server.address().address;
	var port = server.address().port;

	console.log('NANJ SDK listening at http://%s:%s', host, port);
});

module.exports = server