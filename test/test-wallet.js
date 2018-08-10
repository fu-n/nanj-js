//Require the dev-dependencies
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../index')
let should = chai.should()
// let should = chai.expect()

chai.use(chaiHttp)


describe('Testing create wallet', () => {
    describe('- Valid param -', () => {
        it('1. mnemonic phrase required', (done) => {

            let wallet = {}
            
            chai.request(server)
                .post('/api/wallet/create')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('2. mnemonic phrase <= 12 words', (done) => {

            let wallet = {
                mnemonic_phrase: "brain surround have"
            }
            
            chai.request(server)
                .post('/api/wallet/create')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('3. mnemonic phrase wrongs', (done) => {

            let wallet = {
                mnemonic_phrase: "abc def zzz swap horror body response double fire dumb bring hazard"
            }
            
            chai.request(server)
                .post('/api/wallet/create')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });
    });

    describe('- Sucess -', () => {
        it('1. create wallet success', (done) => {

            let wallet = {
                mnemonic_phrase: "brain surround have swap horror body response double fire dumb bring hazard"
            }
            
            chai.request(server)
                .post('/api/wallet/create')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    done();
                });
            
        });
    });
});

describe('Testing import wallet', () => {
    describe('- Valid param -', () => {
        it('1. keystore required', (done) => {

            let wallet = {}
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('2. password required', (done) => {

            let wallet = {
                keystore: '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}'
            }
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('3. keystore and password empty', (done) => {

            let wallet = {
                keystore: null,
                password: null
            }
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('3. password low short', (done) => {

            let wallet = {
                keystore: '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}',
                password: '123'
            }
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('4. password wrong', (done) => {

            let wallet = {
                keystore: '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}',
                password: '123456789'
            }
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });
    });
    
    describe('- Success -', () => {
        it('1. import wallet success', (done) => {

        	let wallet = {
                keystore: '{"version":3,"id":"396c5ff2-18b4-4b33-ade9-6dda8c7dead4","address":"c204626f1e43e3cfbe36e09f8ce88a86588b2cb7","Crypto":{"ciphertext":"893e8ceb0695f226675b13d81ae061bfb7f4bd98c4411c2eb6c4b11b5db4695c","cipherparams":{"iv":"7a1136185e300bde0e52978173559c6e"},"cipher":"aes-128-ctr","kdf":"scrypt","kdfparams":{"dklen":32,"salt":"d9e7913aed8b990dd7cf47abf3f4c64195b1d2ff595ded3dd825991f6db8aea0","n":8192,"r":8,"p":1},"mac":"25b1f048c90720085a14bb01a014bf2970fe2e7928281f5ea9bd2301b2f02461"}}',
                password: '123123123'
            }
            
            chai.request(server)
                .post('/api/wallet/import')
                .send(wallet)
                .set('Content-Type', 'application/json')
            	.set('Accept', 'application/json')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                  	done();
                });
            
        });
    });
});
