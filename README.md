**PREVIEW RELEASE** This is a beta preview release with breaking changes! The current version is 1.0.0 
</br>
<img src="https://nanjcoin.com/nanjs.png" width=100 />
# Nanjs - JavaScript API
[![Join the chat at  https://discord.gg/z3XHJD](https://badges.gitter.im/Join%20Chat.svg)]( https://discord.gg/z3XHJD)
This is the Nanjs JavaScript API which connects to the Nanj-coin system.

## Building

### Features

- [x] Create NANJ Wallet
- [x] Import NANJ Wallet via Private Key / Key Store
- [x] Export Private Key/ Key Store from NANJ Wallet
- [x] Generate NANJ Address
- [x] Generate QRCode from Wallet Address
- [x] Transfer NANJ Coin
- [x] Transaction History
- [x] Get NANJ Rate

### Requirements

* [Node.js](https://nodejs.org)
* npm

## Installation

```shell
/directory$ npm install nanjs
```

## Set config file


## API

**(static) init**
```js
var nanjs = require('nanjs')
```

**createWallet(): Create Wallet**
```js
// It's a async function
// generate address from mnemonic
// password default is 123456789
var mnemonic = nanjs.wallet.generateMnemonic()
console.log( nanjs.wallet.createWallet(mnemonic) )
```

**importWallet(): Import Wallet**
```js
// It's a async function
// generate address from mnemonic
var mnemonic = 'brain surround have swap horror body response double fire dumb bring hazard'
var password = '123456789'
console.log( nanjs.wallet.importWallet(mnemonic, password) )
```

**Generate NANJ Address**
```js
// It's a async function
// generate nanj address
var address = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
var privateKey = '0541a5d81178f67887203996fe596b4fd3de72244e86a371e295f660aab0f039'
nanjs.wallet.generateAddress(address, privateKey).then(function(nanjAddress) {
    console.log(nanjAddress)
  }, function(err) {
    console.log(err)
  })
```

**Generate QRCode from Wallet Address**
```js
// Generate QRCode
// Response is a base64 image 
var address = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'

var base64Url = nanjs.wallet.QRCodeAddress(address)

// Using in html: <img src="base64Url">
```

**Transfer NANJ Coin**
```js
// It's a async function
// make transaction
var from = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
var privateKey = '0541a5d81178f67887203996fe596b4fd3de72244e86a371e295f660aab0f039'
var to = '0xfce1759a46647adfe4f9564320631c4f0a90deba'
var amount = 5
var message = 'nanj transaction'

nanjs.transaction.getRelayerTxHash(from, to, amount, message).then(function(txHash) {
    let data = txHash.data
    let hash = txHash.hash
    let destinationAddress = txHash.destinationAddress

    nanjs.transaction.getHashSign(data, hash, privateKey, destinationAddress).then(function(dataHash) {
      nanjs.transaction.send(dataHash).then(function(response) {
        console.log(response)
      }, function(err) {
        console.log(err)
      })
    }, function(err) {
      console.log(err)
    })
  }, function(err) {
    console.log(err)
  })
```

**Transaction History**
```js
// It's a async function
// Get transaction history
var address = '0xe79c03e29ee86c1d0af6053737dccb029402d0f3'
var page = 1

nanjs.transaction.history(address, page).then(function(response) {
    console.log(response)
  }, function(err) {
    console.log(err)
  })
```

**Get NANJ Rate**
```js
// Get NANJ Rate
// currency is jpy or usd
var currency = 'jpy'

nanjs.transaction.nanjRate(currency).then(function(response) {
    console.log(response)
  }, function(err) {
    console.log(err)
  })
```


### Testing (mocha)

```bash
npm test
```

## Versioning

For the versions available, see the [tags on this repository](https://github.com/NANJ-COIN/nanj-js/tags). 

## Authors

* **NANJ TEAM** [NANJ](https://nanjcoin.com/), support@nanjcoin.com

## License
[LICENSE](https://nanjcoin.com/sdk)
