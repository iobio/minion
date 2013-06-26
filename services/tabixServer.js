#!/usr/bin/env node

// temporary until i understand why freebayes seg faults on the stream
process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    port = 7090;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});

// setup socket
var io = require('socket.io').listen(server);

// set production environment
io.enable('browser client minification');  // send minified client
io.enable('browser client etag');          // apply etag caching logic based on version number
io.enable('browser client gzip');          // gzip the file
io.set('log level', 1);                    // reduce logging

// start server
server.listen(port);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'tabix',
   path: 'tabix',
   json : function(line) { 
      if( line[line.length-1] == "\n" ) line = line.slice(0,-1);
      var fields = line.split("\t");
      if (line && line.charAt(0) != '#') {
         return JSON.stringify(
            { 
               data : {
                chrom    : fields[0],
                pos      : fields[1],
                id       : fields[2],
                ref      : fields[3],
                alt      : fields[4],
                qual     : fields[5],
                filter   : fields[6],
                info     : fields[7],
                format   : fields[8],
                genotypes: fields.slice(9, fields.length)
               }
            }
         );
      } else if(line.slice(0,6) == "#CHROM") 
         return JSON.stringify( {header: { samples : fields.slice(9, fields.length) } } );
   },
   // instructional data used in /help
   description : 'stream sections of static vcf.gz files',
   exampleUrl : "?cmd=-h%20'http://s3.amazonaws.com/1000genomes/release/20101123/interim_phase1_release/ALL.chr2.phase1.projectConsensus.genotypes.vcf.gz'%202:4000000-4050000"   
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
