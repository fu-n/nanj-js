'use strict';

var nanjs = require('../index.js');
var nanjTrans = nanjs.transaction;

var from = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
var privKey = '0541a5d81178f67887203996fe596b4fd3de72244e86a371e295f660aab0f039'
var privKeyNotValid = '1825ae307fa29ebdf4a84877197f4863d58a670832808f8e07cf6a136ee7e1af'
var to = '0xfce1759a46647adfe4f9564320631c4f0a90deba'
var amount = 5
var message = 'unit test nanj transaction'

describe('Testing NANJ transaction', () => {

    describe('- Valid param -', () => {

        it('1. address and amount is required', (done) => {

            nanjTrans.getRelayerTxHash('', '', 0, message).then(function(txHash) {

                if (txHash.status !== 200) {
                    console.log(txHash);
                    done();
                }
                
            }, function(err) {
                console.log(err)
                done();
            })
            
        });

        it('2. Private key is wrong', (done) => {

            nanjTrans.getRelayerTxHash(from, to, amount, message).then(function(txHash) {

                let data = txHash.data
                let hash = txHash.hash
                let destinationAddress = txHash.destinationAddress

                let dataHash = nanjTrans.getHashSign(data, hash, privKeyNotValid, destinationAddress)

                nanjTrans.send(dataHash).then(function(response) {
                    if (response.statusCode !== 200) {
                        console.log(response.message);
                        done();
                    }
                }, function(err) {
                    console.log(err)
                    done();
                })
                
            }, function(err) {
                console.log(err)
                done();
            })
            
        });

        it('3. Amount too big', (done) => {

            nanjTrans.getRelayerTxHash(from, to, 999999999, message).then(function(txHash) {
                
                if (txHash.status !== 200) {
                    console.log(txHash);
                    done();
                }
                
            }, function(err) {
                console.log(err)
                done();
            })
            
        });
    });

    describe('- Success -', () => {
        it('1. Transaction success', (done) => {

            nanjTrans.getRelayerTxHash(from, to, amount, message).then(function(txHash) {
                let data = txHash.data
                let hash = txHash.hash
                let destinationAddress = txHash.destinationAddress

                let dataHash = nanjTrans.getHashSign(data, hash, privKey, destinationAddress)

                nanjTrans.send(dataHash).then(function(response) {
                    console.log(response)
                    done();
                }, function(err) {
                    console.log(err)
                    done();
                })
                
            }, function(err) {
                console.log(err)
                done();
            })
            
        });
    });

});
