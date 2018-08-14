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

const { generateMnemonic, EthHdWallet } = require('eth-hd-wallet')
const ethUtil       = require('ethereumjs-util')
const keythereum    = require('keythereum')

let middleware          = {}
middleware.mnemonic     = require('../middleware/validate-mnemonic.js')
middleware.walletImport = require('../middleware/validate-wallet-import.js')
middleware.trasaction   = require('../middleware/validate-transaction.js')

const generateData = require('../assets/generate-data-relayerTx.js')
const server = require('../assets/server.js')
const appId = config.client_id
const secretKey = config.secret_id

/**
 * Constructor class 
 */
function nanjAPI () {
    
}

/**
 * Check address sender have nanj address already
 * Get NANJ balance
 */ 
nanjAPI.prototype.walletCheck = async function (address) {
    let response = {}
    response.address = await generateData.address(address)
    response.balanceNanj = await generateData.getBalanceNanj(response.address)

    return response
}

/**
 * Get nonce on network 
 */ 
nanjAPI.prototype.relayNonce = async function (address) {
    return await generateData.relayNonce(address)
}

/**
 * API create new wallet
 */ 
nanjAPI.prototype.createWallet = async function (mnemonic, password) {
    const validMNemonic = middleware.mnemonic(mnemonic)

    if (validMNemonic.status !== 200) 
        return validMNemonic
    
    const hdWallet = EthHdWallet.fromMnemonic(mnemonic)
    hdWallet.generateAddresses(1)
    const { wallet } = hdWallet._children[0]
    let response = {}
    response.status = 200
    response.address = wallet.getAddress().toString("hex")
    response.privateKey = wallet._privKey.toString('hex')

    let _password = password || '123456789'

    let opts = {
        salt: ethUtil.crypto.randomBytes(32),
        iv: ethUtil.crypto.randomBytes(16)
    }

    let options = {
        kdf: "scrypt",
        cipher: "aes-128-ctr",
        kdfparams: {
            n: 8192,
            r: 8,
            p: 1
        }
    }

    response.keyStore = keythereum.dump(_password, response.privateKey, opts.salt, opts.iv, options)
    response.nanj = ''
    
    await generateData.generateAddress('0x'+response.address, response.privateKey)

    return response
}

/**
 * API import wallet
 */ 
nanjAPI.prototype.importWallet = async function (jsonKeystore, password) {

    const keyStore = JSON.parse(jsonKeystore.toString('ascii').toLowerCase())

    const validData = middleware.walletImport(keyStore, password)

    if (validData.status !== 200) 
        return validData

    var _salt = ''
    if (keyStore.crypto.kdf == 'pbkdf2') {
        _salt = keyStore.crypto.kdfparams.salt
    } else if (keyStore.crypto.kdf == 'scrypt') {
        _salt = keyStore.crypto.kdfparams.salt
    }

    let response = {}
    response.status = 200

    var privateKey = keythereum.recover(password, keyStore)
    response.address = '0x'+keyStore.address
    response.privateKey = privateKey.toString('hex')

    let opts = {
        salt: _salt,
        iv: keyStore.crypto.cipherparams.iv
    }
    
    response.keyStore = keythereum.dump(password, response.privateKey, opts.salt, opts.iv)
    response.nanj = ''
    
    generateData.generateAddress(response.address, response.privateKey)

    return response
}

/**
 * API get relayer tx hash 
 */ 
nanjAPI.prototype.getRelayerTxHash = async function (from, to, amount, message) {
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
nanjAPI.prototype.getHashSign = async function (data, hash, privKey, destinationAddress) {
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
nanjAPI.prototype.transaction = async function (hashSign) {
    const nanjServer = new server(appId, secretKey)
    return nanjServer.sentRelayTx(hashSign)
}

module.exports = nanjAPI;