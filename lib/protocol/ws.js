var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var ws = function() {
    // Call EventEmitter constructor
    EventEmitter.call(this);
    this.emit('log', 'websocket request');

}

// inherit eventEmitter
inherits(ws, EventEmitter);

ws.prototype.run  = function(cmd, prog, opts) {
    var urlParser = require('../urlParser'),
        BinaryClient = require('binaryjs').BinaryClient,
        self = this,
        url = cmd.url;

    var source = urlParser( url );

    self.emit('log', "requesting url: "+url);

    if(opts && opts.stream !=  undefined) {
        var ustream = opts.stream;
        ustream.pipe(cmd.fifoStream);

        ustream.on('err', function(error) {
            self.emit('error', error);
        })
    }
    else {
		var upstreamClient = new BinaryClient(source.host);
        self.client = upstreamClient;
		upstreamClient.on("open", function() {
			var ustream = upstreamClient.createStream({event:'run', params: source.query });

			ustream.pipe(cmd.fifoStream);

            // pass events up the chain
            ustream.on('err', function(error) { // catch on err here b\c throwing an error on a ws stream
                self.emit('error', error);      // causes the upstream pipe to disconnect
            })
            ustream.on('createClientConnection', function(connection) {
                self.emit('createClientConnection', connection);
            })
      	});
    }
}

ws.prototype.end = function() {
    if(this.client) this.client.close();
}

module.exports = ws;