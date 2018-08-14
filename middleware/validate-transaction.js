'use strict';

module.exports = function (from, to, value) {
	const valid = {status: 200, message: ''}

	if ((typeof from == 'undefined') || (typeof to == 'undefined') || (typeof value == 'undefined') ) {
    	valid.status = 422
    	valid.message = "Address and amount is required."
	} else {
		if (value <= 0) {
	    	valid.status = 422
    		valid.message = "Amount is required."
		}
	}

	return valid
};