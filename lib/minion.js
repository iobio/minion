var createServer = function(port) {
	var minion = require('./server');
	minion.init(port);
	return minion
}

module.exports = createServer;