'use strict';
const config = require('../config');

const CryptoJS = require('crypto-js');
const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(config.http_provider))
const coder = require('web3/lib/solidity/coder')
const leftPad = require('left-pad')
const solsha3 = require('solidity-sha3').default
const utils = require("ethereumjs-util");
const assert = require('assert')

let TXRELAYAddress = config.address_relay_tx
let NANJCOINAddress = config.address_nanjcoin_test
let nanjCoinFounder = config.address_nanj_founder
let metaNanjCoinManagerContractAddress = config.address_meta_nanj_manager
let zeroAddress = "0x0000000000000000000000000000000000000000"

const server = require('../assets/server')
const TXRELAYABI = require('./abi/TXRELAYABI.json');
const NanJABI = require('./abi/NanJABI.json');
const MetaNANJCOINManagerABI = require('./abi/MetaNANJCOINManager.json');

let NANJCoinContract = web3.eth.contract(NanJABI).at(NANJCOINAddress)
let TXRELAY = web3.eth.contract(TXRELAYABI)
let MetaNANJCOINManager = web3.eth.contract(MetaNANJCOINManagerABI)

const appId = config.client_id
const secretKey = config.secret_id
const NanjServer = new server(appId, secretKey)

const getAddressNanj = async function (address) {
    return new Promise((resolve) => {
        let NANJCOINManager = MetaNANJCOINManager.at(metaNanjCoinManagerContractAddress)
        NANJCOINManager.getWallet.call(address, (err,addressNanj) => {
            if (err) {
                console.log(err);
                resolve(zeroAddress);
                return;
            }
            if (addressNanj == zeroAddress) {
                resolve(address);
                return;
            }
            resolve(addressNanj);
        });
    });
}

const generateNanjAddress = async function (address, privKey) {
    return new Promise((resolve) => {
        //console.log(address)
        //console.log(privKey)
        let NANJCOINManager = MetaNANJCOINManager.at(metaNanjCoinManagerContractAddress)
        let txRelayContract = TXRELAY.at(TXRELAYAddress)
        NANJCOINManager.getWallet.call(address, (err,addressNanj) => {
            if (err) {
                console.log(err);
                resolve(zeroAddress);
                return;
            }
            if (addressNanj != zeroAddress) {
                resolve(addressNanj);
                return;
            }
            let types = ['address']
            let params = [address]
            signPayload(address, txRelayContract, zeroAddress, metaNanjCoinManagerContractAddress, 'createWallet', types, params, new Buffer(privKey, 'hex')).then((p) => {
                //console.log(p)
                NanjServer.sentRelayTx(p, 'create wallet').then((result) => {
                    //console.log(result);
                    NANJCOINManager.getWallet.call(address, (err,founderWallet) => {
                        if (err) {
                            console.log(err);
                            resolve(zeroAddress);
                            return;
                        }
                        //console.log('gene nanj: ' + founderWallet)
                        resolve(founderWallet);
                    });
                }).catch((err) => {
                    console.log(err);
                    resolve(zeroAddress);
                })
            }).catch((err) => {
                console.log(err);
                resolve(zeroAddress);
            });
        });
    });
}

const signNanjAddress = async function (address, privKey) {
    return new Promise((resolve) => {
        let NANJCOINManager = MetaNANJCOINManager.at(metaNanjCoinManagerContractAddress)
        let txRelayContract = TXRELAY.at(TXRELAYAddress)
        NANJCOINManager.getWallet.call(address, (err,addressNanj) => {
            if (err) {
                console.log(err);
                resolve('');
                return;
            }
            if (addressNanj != zeroAddress) {
                resolve(addressNanj);
                return;
            }
            let types = ['address']
            let params = [address]
            signPayload(address, txRelayContract, zeroAddress, metaNanjCoinManagerContractAddress, 'createWallet', types, params, new Buffer(privKey, 'hex')).then((p) => {
                resolve(p);
            }).catch((err) => {
                console.log(err);
                resolve('');
            });
        });
    });
}

const getBalanceNanj = async function (address) {
    return new Promise((resolve,reject) => {
        NANJCoinContract.balanceOf(address, (err,balance) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            //console.log('balance: '+balance)
            if (balance <= 0) {
                resolve(0);
                return;
            }
            resolve(balance/100000000);
        });
    });
}

const sdkDeveloper = {
  appId : appId,
  secretKey : secretKey,
  developerAddress : config.address_dev,
  getAppHash: () => { 
    // console.log(web3.sha3(this.appId + this.secretKey))
    return web3.sha3(sdkDeveloper.appId + sdkDeveloper.secretKey) 
  }
}

const pad = function (n) {
    assert.equal(typeof (n), 'string', "Passed in a non string")
    let data
    if (n.startsWith("0x")) {
        data = '0x' + leftPad(n.slice(2), '64', '0')
        assert.equal(data.length, 66, "packed incorrectly")
        return data;
    } else {
        data = '0x' + leftPad(n, '64', '0')
        assert.equal(data.length, 66, "packed incorrectly")
        return data;
    }
}

const encodeFunctionTxData = function (functionName, types, args) {
    var fullName = functionName + '(' + types.join() + ')';
    var signature = CryptoJS.SHA3(fullName, { outputLength: 256 }).toString(CryptoJS.enc.Hex).slice(0, 8);
    var dataHex = '0x' + signature + coder.encodeParams(types, args);
    return dataHex;
}

const signPayload = async function (signingAddr, txRelay, whitelistOwner, destinationAddress, functionName, functionTypes, functionParams, privKey) {
    if (functionTypes.length !== functionParams.length) {
        return //should throw error
    }
    if (typeof (functionName) !== 'string') {
        return //should throw error
    }
    let nonce
    let data
    let hashInput
    let hash
    let sig
    let retVal = {}
    data = encodeFunctionTxData(functionName, functionTypes, functionParams)
    // nonce = await txRelay.getNonce.call(signingAddr)

    nonce = await NanjServer.relayNonce({sender: signingAddr})

    //Tight packing, as Solidity sha3 does
    hashInput = '0x1900' + txRelay.address.slice(2) + whitelistOwner.slice(2) + pad(nonce.data.toString('16')).slice(2)
        + destinationAddress.slice(2) + data.slice(2)
    hash = solsha3(hashInput)
    sig = utils.ecsign(new Buffer(utils.stripHexPrefix(hash), 'hex'), privKey)
    // sig = lightwallet.signing.signMsgHash(lw, keyFromPw, hash, signingAddr)
    retVal.r = '0x' + sig.r.toString('hex')
    retVal.s = '0x' + sig.s.toString('hex')
    retVal.v = sig.v //Q: Why is this not converted to hex?
    retVal.data = data
    retVal.hash = hash
    retVal.nonce = nonce.data
    retVal.dest = destinationAddress
    return retVal
}

const generateDataRelayerTx = async function(from, privKey, to, transferAmount) {
    let founderWallet = await getAddressNanj(from)
    let types = ['address', 'address', 'address', 'uint256', 'bytes', 'bytes32']
    let nanjTransferdata = encodeFunctionTxData('transfer', ['address', 'uint256'], [to, transferAmount])
    let destination = NANJCOINAddress
    let value = 0
    let data = nanjTransferdata 

    let txRELAY = TXRELAY.at(TXRELAYAddress)
    let params = [from, founderWallet, destination, value, data, sdkDeveloper.getAppHash()]

    return signPayload(from, txRELAY, zeroAddress, metaNanjCoinManagerContractAddress,
          'forwardTo', types, params, new Buffer(privKey, 'hex'))
}

// clean function no-private key
const hashSign = async function (sender, txRelay, whitelistOwner, destinationAddress, functionName, functionTypes, functionParams) {
    if (functionTypes.length !== functionParams.length) {
        return //should throw error
    }
    if (typeof (functionName) !== 'string') {
        return //should throw error
    }
    let nonce
    let data
    let hashInput
    let hash
    let sig
    let retVal = {}
    let response = {}
    data = encodeFunctionTxData(functionName, functionTypes, functionParams)

    nonce = await NanjServer.relayNonce({sender: sender})

    //Tight packing, as Solidity sha3 does
    hashInput = '0x1900' + txRelay.address.slice(2) + whitelistOwner.slice(2) + pad(nonce.data.toString('16')).slice(2)
        + destinationAddress.slice(2) + data.slice(2)
    hash = solsha3(hashInput)

    response.data = data
    response.hash = hash
    response.destinationAddress = destinationAddress

    return response
}

const getRelayerTxHash = async function(from, to, transferAmount, message="") {
    let founderWallet = await getAddressNanj(from)
    let types = ['address', 'address', 'address', 'uint256', 'bytes', 'bytes32']
    let nanjTransferdata = encodeFunctionTxData('transfer', ['address', 'uint256', 'bytes'], [to, transferAmount, message])
    let destination = NANJCOINAddress
    let value = 0
    let data = nanjTransferdata 
    
    let txRELAY = TXRELAY.at(TXRELAYAddress)
    let params = [from, founderWallet, destination, value, data, sdkDeveloper.getAppHash()]

    return hashSign(from, txRELAY, zeroAddress, metaNanjCoinManagerContractAddress,
          'forwardTo', types, params)
}

module.exports = {
    pad: pad,
    encodeFunctionTxData: encodeFunctionTxData,
    signPayload: signPayload,
    generateAddress: generateNanjAddress,
    address: getAddressNanj,
    generate: generateDataRelayerTx,
    getBalanceNanj: getBalanceNanj,
    getRelayerTxHash: getRelayerTxHash,
    signNanjAddress: signNanjAddress,
};
