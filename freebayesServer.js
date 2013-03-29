#!/usr/bin/env node

// freebayesServer.js
// example url: curl "http://0.0.0.0:8080/?cmd=-f%20/Users/chase/Tools/freebayes/data/hs_ref_chr11.fa%20http://0.0.0.0:8030?cmd=11:1000000-1050000%2520'http://s3.amazonaws.com/1000genomes/data/NA06984/alignment/NA06984.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06985/alignment/NA06985.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06986/alignment/NA06986.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA06989/alignment/NA06989.chrom11.ILLUMINA.bwa.CEU.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18486/alignment/NA18486.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18487/alignment/NA18487.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18488/alignment/NA18488.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18489/alignment/NA18489.chrom11.ILLUMINA.bwa.YRI.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18525/alignment/NA18525.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18526/alignment/NA18526.chrom11.ILLUMINA.bwa.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18527/alignment/NA18527.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'%2520'http://s3.amazonaws.com/1000genomes/data/NA18528/alignment/NA18528.chrom11.SOLID.bfast.CHB.low_coverage.20111114.bam'"
// example websocket: socket.emit('run', { 'url' : url })


// temporary until i understand why freebayes seg faults on the stream
process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

var minion = require('./minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app);
    

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(8080);

// define tool
var tool = {
   path: '/Users/chase/Tools/freebayes/bin/freebayes',
   options: ['--stdin'],
   json : function(data) {
      data = String(data);      
      var lines = data.split("\n");
      var numLines = lines.length;
      var results = [];
      for (var i=0; i < numLines; i++) {
         var line = lines[i];
         if (line && line.charAt(0) != '#') {
            var values = line.split("\t");
            results.push ({
                chrom    : values[0],
                pos      : values[1],
                id       : values[2],
                ref      : values[3],
                alt      : values[4],
                qual     : values[5],
                filter   : values[6],
                info     : values[7],
                format   : values[8],
                genotypes: values.slice(9, values.length)
            });
         }
      }
      return JSON.stringify(results);
   }
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
