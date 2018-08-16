'use strict';

var nanjs = require('../index.js');

describe('Testing create wallet', () => {
    describe('- Valid param -', () => {
        it('1. mnemonic phrase required', (done) => {

            let mnemonic = ''

            nanjs.wallet.createWallet(mnemonic).then(function(res) {
                console.log(res);
                done();
            })
            
        });

        it('2. mnemonic phrase <= 12 words', (done) => {

            let mnemonic = "brain surround have"
            
            nanjs.wallet.createWallet(mnemonic).then(function(res) {
                console.log(res);
                done();
            })
            
        });

        it('3. mnemonic phrase wrongs', (done) => {

            let mnemonic = "abc def zzz swap horror body response double fire dumb bring hazard"
            
            nanjs.wallet.createWallet(mnemonic).then(function(res) {
                console.log(res);
                done();
            })
            
        });
    });

    describe('- Sucess -', () => {
        it('1. create wallet success', (done) => {

            let mnemonic = "brain surround have swap horror body response double fire dumb bring hazard"
            
            nanjs.wallet.createWallet(mnemonic).then(function(res) {
                console.log('address: '+res.address);
                done();
            })
            
        });
    });
});

describe('Testing import wallet', () => {
    describe('- Valid param -', () => {
        it('1. keystore required', (done) => {

            let keystore = '{}';
            let password = '';

            keystore = JSON.parse(JSON.stringify(keystore))

            nanjs.wallet.importWallet(keystore, password).then(function(res) {
                console.log(res);
                done();
            })
            
        });

        it('2. password required', (done) => {

            let keystore = '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}';
            let password = '';

            keystore = JSON.parse(JSON.stringify(keystore))

            nanjs.wallet.importWallet(keystore, password).then(function(res) {
                console.log(res);
                done();
            })
            
        });

        it('3. password low short', (done) => {

            let keystore = '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}';
            let password = '123';

            keystore = JSON.parse(JSON.stringify(keystore))
            
            nanjs.wallet.importWallet(keystore, password).then(function(res) {
                console.log(res);
                done();
            })
            
        });

        it('4. password wrong', (done) => {

            let keystore = '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}';
            let password = '123456789';

            keystore = JSON.parse(JSON.stringify(keystore))
            
            nanjs.wallet.importWallet(keystore, password).then(function(res) {
                console.log(res);
                done();
            })
            
        });
    });
    
    describe('- Success -', () => {
        it('1. import wallet success', (done) => {

        	let keystore = '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}';
            let password = '123123123';

            keystore = JSON.parse(JSON.stringify(keystore))
            
            nanjs.wallet.importWallet(keystore, password).then(function(res) {
                console.log('address: '+res.address);
                done();
            })
            
        });
    });
});

describe('Testing global wallet', () => {
    describe('- Generate NANJ Address -', () => {
        it('1. Valid param address', (done) => {
            nanjs.wallet.generateAddress('', '').then(function(response) {
                console.log(response)
                done();
            })
        });

        it('2. Valid param private key', (done) => {
            var from = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
            nanjs.wallet.generateAddress(from, '').then(function(response) {
                console.log(response)
                done();
            })
        });

        it('3. Success', (done) => {
            var from = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
            var privKey = '0541a5d81178f67887203996fe596b4fd3de72244e86a371e295f660aab0f039'
            nanjs.wallet.generateAddress(from, privKey).then(function(response) {
                console.log(response)
                done();
            })
        });
    });

    it('QRCode', (done) => {
        var QRCode = require('qrcode')

        var address = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
        QRCode.toDataURL(address, function (err, url) {
            console.log(url);
            done();
        })
    });
})
