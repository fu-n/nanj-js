'use strict';

const CryptoJS = require('crypto-js');
var Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider(process.env.HTTPP_ROVIDER))
const coder = require('web3/lib/solidity/coder')
const leftPad = require('left-pad')
const solsha3 = require('solidity-sha3').default
const utils = require("ethereumjs-util");
const assert = require('assert')

let TXRELAYAddress = process.env.TXRELAY_ADDRESS
let NANJCOINAddress = process.env.ADDRESS_NANJCOIN_TEST
let nanjCoinFounder = process.env.ADDRESS_NANJ_FOUNDER
let metaNanjCoinManagerContractAddress = process.env.ADDRESS_META_NANJ_MANAGER
let zeroAddress = "0x0000000000000000000000000000000000000000"

const server = require('../assets/server')
const TXRELAYABI = require('./abi/TXRELAYABI.json');
const NanJABI = require('./abi/NanJABI.json');
const MetaNANJCOINManagerABI = require('./abi/MetaNANJCOINManager.json');

let NANJCoinContract = web3.eth.contract(NanJABI).at(NANJCOINAddress)
let TXRELAY = web3.eth.contract(TXRELAYABI)
let MetaNANJCOINManager = web3.eth.contract(MetaNANJCOINManagerABI)

const appId = process.env.CLIENT_ID
const secretKey = process.env.SECRET_KEY
const NanjServer = new server(appId, secretKey)

const getAddressNanj = async function (address) {
    let NANJCOINManager = MetaNANJCOINManager.at(metaNanjCoinManagerContractAddress)
    let addressNanj = await NANJCOINManager.getWallet.call(address)

    if (addressNanj == zeroAddress)
        return address
    
    return addressNanj
}

const generateNanjAddress = async function (address, privKey) {
    // console.log(address)
    // console.log(privKey)
    let NANJCOINManager = MetaNANJCOINManager.at(metaNanjCoinManagerContractAddress)
    let txRelayContract = TXRELAY.at(TXRELAYAddress)
    let addressNanj = await NANJCOINManager.getWallet.call(address)
    if (addressNanj == zeroAddress) {
          let types = ['address']
          let params = [address]

          let p = await signPayload(address, txRelayContract, zeroAddress, metaNanjCoinManagerContractAddress,
            'createWallet', types, params, new Buffer(privKey, 'hex'))
          // console.log(p)
          
          NanjServer.sentRelayTx(p, 'create wallet').then(function(result) {
                let founderWallet = NANJCOINManager.getWallet.call(address)
                // console.log('gene nanj: '+founderWallet)
                return founderWallet
            }, function(err) {
                return zeroAddress
            })
    }
    return addressNanj
}

const getBalanceNanj = async function (address) {
    let balance = await NANJCoinContract.balanceOf(address)

    // console.log('balance: '+balance)

    if (balance > 0) 
        return (balance/100000000);

    return 0;
}

const sdkDeveloper = {
  appId : process.env.CLIENT_ID,
  secretKey : process.env.SECRET_KEY,
  developerAddress : process.env.DEV_ADDRESS,
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
    getRelayerTxHash: getRelayerTxHash
};