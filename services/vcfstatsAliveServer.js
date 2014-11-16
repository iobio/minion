#!/usr/bin/env node
// Tony Di Sera 2014


// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    BinaryServer = require('binaryjs').BinaryServer,
    port = 7070;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});    

// setup socket
var bs = BinaryServer({server: server});

// start server
server.listen(port);


// define tool
tool = {
   apiVersion : "0.1",
   name : 'vcfstatsAlive',
   path :  'vcfstatsalive',
   inputOption: '-fake',


   // instructional data used in /help
   description : 'utility for bam files',
   exampleUrl : "fill in"
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(bs);
console.log('iobio server started on port ' + port);
