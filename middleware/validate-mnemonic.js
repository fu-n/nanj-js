'use strict';

var bip39 = require('bip39')

var getWordCount = function(str) {
  return str.trim().split(/\s+/).length;
}

module.exports = function (mnemonic) {
	const valid = {status: 200, message: ''}

	if ((typeof mnemonic == "undefined") || (mnemonic.length == 0)) {
		valid.status = 422
    	valid.message = "Mnemonic Phrase is required."
	} else {
		mnemonic = mnemonic.trim();
		if (getWordCount(mnemonic) < 12) {
			valid.status = 422
			valid.message = "Mnemonic Phrase are 12 words long."
		}

		if (! bip39.validateMnemonic(mnemonic)) {
			valid.status = 422
			valid.message = "Mnemonic Phrase is invalid."
		}
	}

	return valid
};