// Minion Config file


var config = {
	platform : 'default', 			// 'default' returns nothing. 'amazon' will use amazon dns lookup to get hostname so you can use ssl
	maxConcurrentCommands: 1, 	// accepts a number or null. null allows unlimimited commands
	noQueueDomains: ['localhost', 'iobio.io', null]
}

module.exports = config;