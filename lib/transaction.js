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
'use strict';
const config = require('../config')

const ethUtil       = require('ethereumjs-util')

let middleware          = {}
middleware.mnemonic     = require('../middleware/validate-mnemonic.js')
middleware.walletImport = require('../middleware/validate-wallet-import.js')
middleware.trasaction   = require('../middleware/validate-transaction.js')

const generateData = require('../assets/generate-data-relayerTx.js')
const server = require('../assets/server.js')
const appId = config.client_id
const secretKey = config.secret_id

/**
 * API get relayer tx hash 
 */ 
exports.getRelayerTxHash = async function (from, to, amount, message) {
    // check validator input data
    const validData = middleware.trasaction(from, to, amount)

    if (validData.status !== 200) 
        return validData

    // check balance 
    let nanjAddress = await generateData.address(from)
    let balance = await generateData.getBalanceNanj(nanjAddress)

    if (balance <= 0 || amount > balance)
        return {status: 403, message: "Your balance too low."}

    return await generateData.getRelayerTxHash(from, to, amount+"00000000", message)
}

/**
 * API get hash sign data
 * data, hash, destinationAddress from `getRelayerTxHash` API
 */ 
exports.getHashSign = async function (data, hash, privKey, destinationAddress) {
    let sig = ethUtil.ecsign(new Buffer(ethUtil.stripHexPrefix(hash), 'hex'), new Buffer(privKey, 'hex'))

    let hashSign = {}
    hashSign.r = '0x' + sig.r.toString('hex')
    hashSign.s = '0x' + sig.s.toString('hex')
    hashSign.v = sig.v //Q: Why is this not converted to hex?
    hashSign.data = data
    hashSign.hash = hash
    hashSign.dest = destinationAddress
    
    return hashSign
}

/**
 * API send transaction 
 */ 
exports.send = function (hashSign) {
    const nanjServer = new server(appId, secretKey)
    return nanjServer.sentRelayTx(hashSign)
}

/**
 * API get transaction history
 */ 
exports.history = async function (address, page) {
    if (typeof address == 'undefined') {
        let valid = {}
        valid.status = 422
        valid.message = "Address is required."

        return valid
    }

    const nanjServer = new server(appId, secretKey)
    return nanjServer.getTransactionHistory(address, page)
}
