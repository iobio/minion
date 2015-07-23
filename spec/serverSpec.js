// url command

// file command

// ws

// http

'use strict';

var request = require("request"),
	port = 8060,
	host = "http://localhost:"+port,
    minion = require('../index.js')(port),
    BinaryClient = require('binaryjs').BinaryClient;
// var     iobio = require ('../../iobio.js/src/cmd.js');    

// // define tool
var tool = {name : 'samtools', path: 'samtools',args: ['-']};

// // start minion socket
minion.listen(tool);


describe("Server", function() {	
    // it("executes a simple http url command", function(done) {
    // 	var cmd_url = "http://localhost:"+port+"?cmd=https://s3.amazonaws.com/iobio/jasmine_files/test.minion.txt"
    // 	request.get(cmd_url, function(error, response, body) {
    // 		console.log(body);
    //     	expect(body).toEqual('this is used to test minion');
    //     	done();
    //   });
    // });

	describe('Error when program is not in ./bin', function() {
		// it("errors when program is not in ./bin", function(done) {
	 //    	var cmd_url = "http://localhost:"+port+"?cmd=https://s3.amazonaws.com/iobio/jasmine_files/test.minion.txt"	    	
	 //    	request.get(cmd_url, function(error, response, body) {
	 //    		console.log('in reqeust');
	 //    		console.log('in error = ' + error);
	 //    		console.log('in response = ' + JSON.stringify(response));
	 //    		console.log('in body = ' + body);
	 //        	expect(body).toEqual('this is used to test minion');
	 //        	done();
	 //      	});      	
  //   	});

		// it('testing', function() {
		// 	expect('hi').toEqual('hi');
		// })
		// it("for websocket command", function(done) {
	    	
	 //    	console.log('in t');
	 //    	cmd.on('error', function(err) {
	 //    		expect(err).toEqual('some error');
	 //    		done();
	 //    	})	    	
	 //    	cmd.run();
	 //    	cmd.on('data', function(d) {
	 //    		console.log(d);
	 //    		done();
	 //    	})
  //   	});
    	


    	var url = host + '?cmd=view%20http://s3.amazonaws.com/iobio/jasmine_files/test.bam%201';
    	var data;		

   //  	beforeEach(function(done) {
   //  		var client = new BinaryClient(url);
			// client.on("open", function() {
			// 	var stream = client.createStream({event:'run', params: {'url':url} });				
			// 	// stream.pipe(process.stdin);
			// 	stream.on("data", function(d) {					
		 //            var data = d.split("\t")[0];	
		 //            console.log('data = ' + data);	            
		 //            done();		            
	  //         	})            
	  //         	stream.on('error', function(err) {
	  //         		// catch errors and do nothing
	  //         	})
	  //     	});
   //  	})
        
        it("simple url command", function(done) {  
        	var client = new BinaryClient(url);
			client.on("open", function() {
				var stream = client.createStream({event:'run', params: {'url':url} });				
				// stream.pipe(process.stdin);
				stream.on("data", function(d) {					
		            var data = d.split("\t")[0];			            
		            expect(data).toEqual('ERR194147.602999777');
		            done();		            
	          	})            
	          	stream.on('error', function(err) {
	          		// catch errors and do nothing
	          	})
	      	});      	
        	
        });
	})
});

// minion.close();