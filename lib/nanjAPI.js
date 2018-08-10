/*
    This file is part of nanjAPI.js.

    nanjAPI.js is free software: you can create / import and trasaction NANJ.
*/
/**
 * @file nanjAPI.js
 * @authors:
 *   NANJ <nanj@nanj.com>
 * @date 2018
 */

const generateData = require('../assets/generate-data-relayerTx.js')


function nanjAPI () {


    this._extend = extend(this);
    this._extend({
        properties: properties()
    });
}

nanjAPI.prototype.walletCheck = function (address) {
    let response = {}
    generateData.address(address).then(function(result) {
        response.address = result
        generateData.getBalanceNanj(result).then(function(balance) {
            response.balanceNanj = balance
            return res.status(200).json({ statusCode: 200, message: 'Success.', data: response });
        })
        
    }, function(err) {
        return res.json(err)
    });
}

module.exports = nanjAPI;

