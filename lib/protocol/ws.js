var ws = function(url, prog, opts) {
	
    console.log("websocket request");
    var minionClient = require('../minion-client');
    var BinaryClient = require('binaryjs').BinaryClient;
    
    var source = minionClient.url.parse( url );
    
    if(opts.client !=  undefined) {
    	console.log('c = ' + opts.client);
    	var client = opts.client;
		var ustream = client.createStream({event:'run', params: source.query });
		ustream.pipe(prog.stdin);
		ustream.on('end', function() { 
        	prog.stdin.end() 
      	})
    }
    else {
    	console.log('in else');
		var upstreamClient = new BinaryClient(source.host);
		upstreamClient.on("open", function() {
			var ustream = upstreamClient.createStream({event:'run', params: source.query });
			ustream.pipe(prog.stdin);  
			ustream.on("end", function() {
            // close stream
            	prog.stdin.end();
          	})            
      	});
    }
}

module.exports = ws;