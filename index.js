var config = require('./config');
var nanjAPI = require('./lib/nanjAPI');

// dont override global variable
if (typeof window !== 'undefined' && typeof window.nanjAPI === 'undefined') {
    window.nanjAPI = nanjAPI;
}

module.exports = nanjAPI;
