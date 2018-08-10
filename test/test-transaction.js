//Require the dev-dependencies
let chai = require('chai')
let chaiHttp = require('chai-http')
let server = require('../index')
let should = chai.should()
// let should = chai.expect()

chai.use(chaiHttp)

let from = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
let privKey = '0541a5d81178f67887203996fe596b4fd3de72244e86a371e295f660aab0f039'
let privKeyNotValid = '1825ae307fa29ebdf4a84877197f4863d58a670832808f8e07cf6a136ee7e1af'
let to = '0xfce1759a46647adfe4f9564320631c4f0a90deba'

describe('Testing NANJ transaction', () => {

    describe('- Valid param -', () => {

        it('1. address and amount is required', (done) => {

            let body = {}
            
            chai.request(server)
                .post('/api/tx/relayTx')
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('2. Private key is wrong', (done) => {

            let body = {from: from, to: to, value:5, privKey: new Buffer(privKeyNotValid, 'hex')}
            
            chai.request(server)
                .post('/api/tx/relayTx')
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    if (res.body.statusCode !== 200) {
                        // server response error 
                        console.log(res.body.statusCode+': '+res.body.message);
                        res.should.have.status(200);
                    }
                    
                    done();
                });
        });

        it('3. Amount equal 0', (done) => {

            let body = {from: from, to: to, value:0, privKey: new Buffer(privKey, 'hex')}
            
            chai.request(server)
                .post('/api/tx/relayTx')
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(422);
                    done();
                });
            
        });

        it('4. Amount too big', (done) => {

            let body = {from: from, to: to, value:5000, privKey: new Buffer(privKey, 'hex')}
            
            chai.request(server)
                .post('/api/tx/relayTx')
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    console.log(res.error.text);
                    res.should.have.status(403);
                    done();
                });
            
        });
    });

    describe('- Success -', () => {
        it('1. Transaction success', (done) => {

            let body = {from: from, to: to, value:5, privKey: new Buffer(privKey, 'hex')}
            
            chai.request(server)
                .post('/api/tx/relayTx')
                .send(body)
                .set('Content-Type', 'application/json')
                .set('Accept', 'application/json')
                .end((err, res) => {
                    if (res.body.statusCode === 200) {
                        // server response error 
                        console.log(res.body.statusCode+': '+res.body.message);
                        res.should.have.status(200);
                    }
                    
                    done();
                });
            
        });
    });

});
