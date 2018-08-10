'use strict';

var ethUtil     = require('ethereumjs-util');
ethUtil.crypto  = require('crypto');
ethUtil.scrypt  = require('scryptsy');
ethUtil.uuid    = require('uuid');

module.exports = {
    toV3: function(address, password, privKey, opts) {
        opts = opts || {}
        var salt = opts.salt || ethUtil.crypto.randomBytes(32)
        var iv = opts.iv || ethUtil.crypto.randomBytes(16)
        var derivedKey
        var kdf = opts.kdf || 'scrypt'
        var kdfparams = {
            dklen: opts.dklen || 32,
            salt: salt.toString('hex')
        }
        if (kdf === 'pbkdf2') {
            kdfparams.c = opts.c || 8192
            kdfparams.prf = 'hmac-sha256'
            derivedKey = ethUtil.crypto.pbkdf2Sync(new Buffer(password), salt, kdfparams.c, kdfparams.dklen, 'sha256')
        } else if (kdf === 'scrypt') {
            // FIXME: support progress reporting callback
            kdfparams.n = opts.n || 8192
            kdfparams.r = opts.r || 8
            kdfparams.p = opts.p || 1
            derivedKey = ethUtil.scrypt(new Buffer(password), salt, kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen)
        } else {
            throw new Error('Unsupported kdf')
        }
        var cipher = ethUtil.crypto.createCipheriv(opts.cipher || 'aes-128-ctr', derivedKey.slice(0, 16), iv)
        if (!cipher) {
            throw new Error('Unsupported cipher')
        }
        var ciphertext = Buffer.concat([cipher.update(privKey), cipher.final()])
        var mac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), new Buffer(ciphertext, 'hex')]))
        return {
            version: 3,
            id: ethUtil.uuid.v4({
                random: opts.uuid || ethUtil.crypto.randomBytes(16)
            }),
            address: address.toString('hex'),
            Crypto: {
                ciphertext: ciphertext.toString('hex'),
                cipherparams: {
                    iv: iv.toString('hex')
                },
                cipher: opts.cipher || 'aes-128-ctr',
                kdf: kdf,
                kdfparams: kdfparams,
                mac: mac.toString('hex')
            }
        }
    }
}