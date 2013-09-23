#!/usr/bin/env node

// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    BinaryServer = require('../../iobio-bam/binarytest/binaryjs/lib/server.js').BinaryServer,
    port = 8020;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});    

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(port);


// define tool
tool = {
   apiVersion : "0.1",
   name : 'bam binner',
   path :  'bamBinnerHelper.sh',
   json: function(data) {
      data = String(data);
      var results = data.trim().split("\n")
      return JSON.stringify(results);
   },
    // instructional data used in /help
    description : 'bin bam read depth data for use in charts',
    exampleUrl : "http://bamBinner.iobio.io?cmd=11:10108473-10188473%20'http://s3.amazonaws.com/1000genomes/data/NA06984/alignment/NA06984.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%20'http://s3.amazonaws.com/1000genomes/data/NA06985/alignment/NA06985.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'&format=json"
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(bs);
console.log('iobio server started on port ' + port);