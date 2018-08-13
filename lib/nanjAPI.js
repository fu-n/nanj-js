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
const { generateMnemonic, EthHdWallet } = require('eth-hd-wallet')
const ethUtil       = require('ethereumjs-util')
const keythereum    = require("keythereum")

let middleware          = {}
middleware.mnemonic     = require('../middleware/validate-mnemonic.js')
middleware.walletImport = require('../middleware/validate-wallet-import.js')

const generateData = require('../assets/generate-data-relayerTx.js')

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
    
    generateData.generateAddress(response.address, response.privateKey)

    return response
}

module.exports = nanjAPI;