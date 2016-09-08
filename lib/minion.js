require('console-stamp')(console, '[HH:MM:ss.l]');

var createServer = function(port) {
	// get command line options
	var opts = require('minimist')(process.argv.slice(2));

	// init server
	var minion = require('./server');
	minion.init(port,opts);
	return minion
}

module.exports = createServer;