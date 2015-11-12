// url command

// file command

// ws

// http

'use strict';

var request = require("request"),
	port = 8060,
	host = "http://localhost:"+port,    
    BinaryClient = require('binaryjs').BinaryClient;
// var     iobio = require ('../../iobio.js/src/cmd.js');    

var samtoolsConfig = {name : 'samtools', path: 'samtools',args: ['-']};


describe("Server", function() {	

	describe("execute", function() {
		beforeEach(function(done) {
			this.minion = require('../index.js')(port);
			this.minion.listen( samtoolsConfig );
			var url = host + '?cmd=view%20http://s3.amazonaws.com/iobio/jasmine_files/test.bam%201';
			var client = new BinaryClient(url);
			var me = this;
			client.on("open", function() {
				var stream = client.createStream({event:'run', params: {'url':url} });
				stream.on("data", function(d) {
		            me.result = d.split("\t")[0];
		            done();
	          	})   
	          	stream.on('err', function(error) {  /* ignore errors */ })
	      	});
		})
	    it("simple ws url command", function() {
			expect(this.result).toEqual('ERR194147.602999777');
	    });
	    afterEach(function() {
	    	this.minion.close();
	    })
	});

	describe("execute", function() {
		beforeEach(function(done) {
			// turn on server
			this.minion = require('../index.js')(port);
			this.minion.listen( samtoolsConfig );

			// create file
			var file = "@HD\tVN:1.3\tSO:coordinate\n@SQ\tSN:1\tLN:249250621\n@RG\tID:ERR194147\tLB:NA12878_1\tPL:ILLUMINA\tPU:ILLUMINA-1\tSM:NA12878\nERR194147.602999777 147 1   11919   0   101M    =   11675   -345\   ATTTGCTGTCTCTTAGCCCAGACTTCCCGTGTCCTTTCCACCGGGCCTTTGAGAGGTCACAGGGTCTTGATGCTGTGGTCTTCATCTGCAGGTGTCTGACT   B@>CEIIIJJJJGHJIGGIIGDIEHFFCFHFGHIFFHEFCE@BBEBECDFDDDDBEDGEFEABEDEBDCDDEFEDDADCDBCEDCDDDECBDEDEECB?AA   MC:Z:101M   BD:Z:KBKOSRLQNONMLMPPKOOKONLLMJLLIINMNLBLMNIMLLJNNMKAJLJJJLMMMHHNLIMMKKJLMLNONHHMMMKKKMMLKNNNOMNIJONRPONJJ  MD:Z:101    PG:Z:MarkDuplicates RG:Z:ERR194147  BI:Z:OFMQTTNRPRPQOQRRMQRORQONPLNPLLPPOOFNPPLPNNLPQOOFMPLNKONOPKKPOKNOMNLOOOPQQKKPNOMNMPPOMQPPPOOLLPOSRQQMM  NM:i:0  MQ:i:0  AS:i:101    XS:i:101\n";            

			var url = host + '?cmd=view%20-S%20-H%20http%3A%2F%2Fclient';
			var client = new BinaryClient(url);
			var me = this;
			client.on("open", function() {
				var stream = client.createStream({event:'run', params: {'url':url} });

				stream.on('createClientConnection', function(connection) {
					var serverAddress = connection.serverAddress || 'localhost:' + port;
					var dataClient = BinaryClient('ws://' + serverAddress);
					dataClient.on('open', function() {
						var dataStream = dataClient.createStream({event:'clientConnected', 'connectionID' : connection.id});
						dataStream.write(file);
						dataStream.end();
					})
	            })

				stream.on("data", function(d) {
		            me.result = d.split("\t").join("").split("\n").join("");
		            done();
	          	})
	          	stream.on('err', function(error) {  /* ignore errors */ })
	      	});
		})
	    it("simple ws file command", function() {
			expect(this.result).toEqual("@HDVN:1.3SO:coordinate@SQSN:1LN:249250621@RGID:ERR194147LB:NA12878_1PL:ILLUMINAPU:ILLUMINA-1SM:NA12878");
	    });
	    afterEach(function() {
	    	this.minion.close();
	    })
	});

	describe("execute", function() {
		beforeEach(function(done) {
			this.minion = require('../index.js')(port);
			this.minion.listen( samtoolsConfig );
			var url = host + '?cmd=view%20http://s3.amazonaws.com/iobio/jasmine_files/test.bam%201';
			var me = this;
			request(url, function (error, response, body) {
				if (!error && response.statusCode == 200) {
					me.result = body.split("\t")[0];
				}
				done();
			})
		})
	    it("simple http url command", function() {
			expect(this.result).toEqual('ERR194147.602999777');
	    });
	    afterEach(function() {
	    	this.minion.close();
	    })
	});

	describe("bin sandbox", function() {
		beforeEach(function(done) {
			this.minion = require('../index.js')(port);
			this.minion.listen( {name : 'notool', path: '../notool'} );
			var url = host + '?cmd=view%20http://s3.amazonaws.com/iobio/jasmine_files/test.bam%201';
			var client = new BinaryClient(url);
			var me = this;
			client.on("open", function() {
				var stream = client.createStream({event:'run', params: {'url':url} });
				stream.on("data", function(d) {	/* ignore data */ })
	          	stream.on('err', function(error) {
	          		me.result = error;
	          		done();
	          	})
	      	});
		})
	    it("errors when path is outside of bin sandbox", function() {
			expect(this.result).toEqual('notool Error: Program path not in executable directory. Only programs in minion/bin/ directory are executable');
	    });
	    afterEach(function() {
	    	this.minion.close();
	    })
	});

	describe("bin sandbox", function() {
		beforeEach(function(done) {
			this.minion = require('../index.js')(port);
			this.minion.listen( {name : 'notool', path: 'notool'} );
			var url = host + '?cmd=view%20http://s3.amazonaws.com/iobio/jasmine_files/test.bam%201';
			var client = new BinaryClient(url);
			var me = this;
			client.on("open", function() {
				var stream = client.createStream({event:'run', params: {'url':url} });
				stream.on("data", function(d) {	/* ignore data */ })
	          	stream.on('err', function(error) {
	          		me.result = error;
	          		done();
	          	})
	      	});
		})
	    it("errors when tool doesn't exist", function() {
			expect(this.result).toEqual('notool Error: Program not found. Only programs in minion/bin/ directory are executable');
	    });
	    afterEach(function() {
	    	this.minion.close();
	    })
	});
});