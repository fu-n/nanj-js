'use strict';

var keythereum 	= require("keythereum");
var ethUtil 	= require('ethereumjs-util');
ethUtil.crypto 	= require('crypto');
ethUtil.scrypt 	= require('scryptsy');

module.exports = function (keystore, password) {
	const valid = {status: 200, message: ''}

	if ((typeof keystore == "undefined") || (keystore.length == 0)) {
		valid.status = 422
		valid.message = "Keystore is required."

		return valid
	} else if ((typeof password == "undefined") || (password.length == 0)) {
    	valid.status = 422
		valid.message = "Password is required."

		return valid
	} else {
		// validate keystore 
	    var derivedKey = ''
    	var kdfparams = {}
    	if (typeof keystore.crypto == 'undefined') {
    		valid.status = 403
			valid.message = "Wallet format unknown or unsupported!"

			return valid
    	} else if (keystore.crypto.kdf == 'pbkdf2') {
	    	kdfparams = keystore.crypto.kdfparams
	        if (kdfparams.prf != 'hmac-sha256') {
	        	valid.status = 403
				valid.message = "Unsupported parameters to PBKDF2"

				return valid
	        }

	        derivedKey = ethUtil.crypto.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256');
	    } else if (keystore.crypto.kdf == 'scrypt') {
	    	kdfparams = keystore.crypto.kdfparams;
        	derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
	    } else {
	    	valid.status = 403
			valid.message = "Wallet format unknown or unsupported!"

			return valid
	    }

		// validate password
        if (password.length < 9) {
	    	valid.status = 422
			valid.message = "Your password must be at least 9 characters. Please ensure it is a strong password."

			return valid
		}

		var ciphertext = new Buffer(keystore.crypto.ciphertext, 'hex');
		var newMac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));

		if (newMac.toString('hex') !== keystore.crypto.mac) {
			valid.status = 422
			valid.message = "Key derivation failed - possibly wrong passphrase."

			return valid
		}
		
		return valid
	}
};