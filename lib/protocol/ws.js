var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var ws = function() {
    // Call EventEmitter constructor
    EventEmitter.call(this);    
    this.emit('log', 'websocket request');
      
}
  
// inherit eventEmitter
inherits(ws, EventEmitter);

ws.prototype.run  = function(url, prog, opts) {
    var urlParser = require('../urlParser'),
        BinaryClient = require('binaryjs').BinaryClient,
        self = this;

    var source = urlParser( url );

    self.emit('log', "requesting url: "+url);    

    if(opts && opts.stream !=  undefined) {     
        var ustream = opts.stream;            
        ustream.pipe(prog.stdin);
        ustream.on('end', function() { 
            prog.stdin.end() 
        })
        ustream.on('err', function(error) {
            self.emit('error', error);
        })
    }
    else {    	
		var upstreamClient = new BinaryClient(source.host);
		upstreamClient.on("open", function() {
			var ustream = upstreamClient.createStream({event:'run', params: source.query });
			ustream.pipe(prog.stdin);  
			ustream.on("end", function() {
            // close stream
            	prog.stdin.end();
          	})

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

module.exports = ws;