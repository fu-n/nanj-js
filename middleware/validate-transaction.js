'use strict';

module.exports = function (req, res, next) {
	let from = req.body.from
	let to = req.body.to
	let value = req.body.value

	if ((typeof from == 'undefined') || (typeof to == 'undefined') || (typeof value == 'undefined') ) {
    	return res.status(422).json({message: "Address and amount is required."});
	} else {
		if (value <= 0)
	    	return res.status(422).json({message: "Amount is required."});

		return next();
	}
};