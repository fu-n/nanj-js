'use strict';

var keythereum 	= require("keythereum");
var ethUtil 	= require('ethereumjs-util');
ethUtil.crypto 	= require('crypto');
ethUtil.scrypt 	= require('scryptsy');

module.exports = function (req, res, next) {

	if (req.files === null) {
		return res.status(422).json({message: "Keystore is required."});
	}
	
	var jsonKeystore = null;
	if (typeof req.files == 'undefined') {
		if (typeof req.body.keystore == 'undefined') {
			return res.status(422).json({message: "Keystore is required."});
		}

		jsonKeystore = req.body.keystore;
	} else {
		jsonKeystore = (typeof req.files.keystore == 'undefined')?null:req.files.keystore.data;
	}

	if (jsonKeystore === null) {
		return res.status(422).json({message: "Keystore is required."});
	}

	var keystore = JSON.parse(jsonKeystore.toString('ascii').toLowerCase());
    var password = req.body.password;

	if ((typeof keystore == "undefined") || (keystore.length == 0)) {
    	return res.status(422).json({message: "Keystore is required."});
	} else if ((typeof password == "undefined") || (password.length == 0)) {
    	return res.status(422).json({message: "Password is required."});
	} else {
		// validate keystore 
	    var derivedKey;
    	var kdfparams;
    	if (typeof keystore.crypto == 'undefined') {
    		return res.status(422).json({message: "Wallet format unknown or unsupported!"});
    	} else if (keystore.crypto.kdf == 'pbkdf2') {
	    	kdfparams = keystore.crypto.kdfparams
	        if (kdfparams.prf != 'hmac-sha256') {
	        	return res.status(422).json({message: "Unsupported parameters to PBKDF2"});
	        }

	        derivedKey = ethUtil.crypto.pbkdf2Sync(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.c, kdfparams.dklen, 'sha256');
	    } else if (keystore.crypto.kdf == 'scrypt') {
	    	kdfparams = keystore.crypto.kdfparams;
        	derivedKey = ethUtil.scrypt(new Buffer(password), new Buffer(kdfparams.salt, 'hex'), kdfparams.n, kdfparams.r, kdfparams.p, kdfparams.dklen);
	    } else {
	    	return res.status(422).json({message: "Wallet format unknown or unsupported!"});
	    }

		// validate password
        if (password.length < 9) {
	    	return res.status(422).json({message: "Your password must be at least 9 characters. Please ensure it is a strong password."});
		}

		var ciphertext = new Buffer(keystore.crypto.ciphertext, 'hex');
		var newMac = ethUtil.sha3(Buffer.concat([derivedKey.slice(16, 32), ciphertext]));

		if (newMac.toString('hex') !== keystore.crypto.mac) {
			return res.status(422).json({message: "Key derivation failed - possibly wrong passphrase."});
		}
		return next();
	}
};