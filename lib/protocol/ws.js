var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var ws = function() {
    // Call EventEmitter constructor
    EventEmitter.call(this);
    this.emit('log', 'websocket request');

}

// inherit eventEmitter
inherits(ws, EventEmitter);

ws.prototype.run  = function(cmd, progStream, opts) {
    var urlParser = require('../urlParser'),
        BinaryClient = require('binaryjs').BinaryClient,
        self = this,
        url = cmd.url;

    var source = urlParser( url );
    self.emit('log', " requesting url: "+url);

    if(opts && opts.stream !=  undefined) {
        var ustream = opts.stream;
        self.ustream = ustream;
        ustream.pipe(progStream);

        ustream.on('err', function(error) {
            self.emit('error', error);
        })
        ustream.on('end', function() {
           if (ustream.client) { ustream.client.close() };
        })
    }
    else {
		var upstreamClient = new BinaryClient(source.host);
        self.client = upstreamClient;
		upstreamClient.on("open", function() {
			var ustream = upstreamClient.createStream({event:'run', params: source.query });
            self.ustream = ustream;
			ustream.pipe(progStream);

            // pass events up the chain
            ustream.on('err', function(error) { // catch on err here b\c throwing an error on a ws stream
                self.emit('error', error);      // causes the upstream pipe to disconnect
            })
            ustream.on('createClientConnection', function(connection) {
                self.emit('createClientConnection', connection);
            })
            ustream.on('end', function() { upstreamClient.close(); })
      	});
    }
}

ws.prototype.end = function() {
    // send end event without ending stream
    // this lets upstream streams end first, which causes
    // downstream streams to end gracefully when the data runs out
    if (this.ustream) this.ustream.message('softend');
}

module.exports = ws;
