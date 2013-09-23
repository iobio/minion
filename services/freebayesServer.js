#!/usr/bin/env node

// freebayesServer.js
// example url: curl "http://0.0.0.0:8080/?cmd=-f%20/Users/chase/Tools/freebayes/data/hs_ref_chr11.fa%20http://0.0.0.0:8030?cmd=11:1000000-1050000%2520'http://s3.amazonaws.com/1000genomes/data/NA06984/alignment/NA06984.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06985/alignment/NA06985.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06986/alignment/NA06986.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06989/alignment/NA06989.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18486/alignment/NA18486.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18487/alignment/NA18487.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18488/alignment/NA18488.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18489/alignment/NA18489.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18525/alignment/NA18525.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18526/alignment/NA18526.chrom11.ILLUMINA.bwa.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18527/alignment/NA18527.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18528/alignment/NA18528.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'"
// example websocket: socket.emit('run', { 'url' : url })


// temporary until i understand why freebayes seg faults on the stream
process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    BinaryServer = require('binaryjs').BinaryServer,
    port = 8080;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});

// setup socket
var bs = BinaryServer({server: server});

// start server
server.listen(port);

// define tool
var tool = {
   name: 'freebayes',
   path: 'freebayes',
   options: ['--stdin'],
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
   description : 'variant caller',
   exampleUrl : ""
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(bs);
console.log('iobio server started on port ' + port);