#!/usr/bin/env node

// temporary until i understand why freebayes seg faults on the stream
process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    port = 8060;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(port);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'samtools',   
   path: 'samtools',
   args: ['-'],
   binary: true
   // pipe: "bcftools view -vcg -",
   // send : function(data) {
   //    socket.emit( 'results', { 
   //       data : new Buffer(data, 'binary').toString('base64'),
   //       options : { convert: {from:'base64', to:'binary'} }
   //    });
   // }    
   // send : function(socket, data) {
   //    data = String(data);
   //    var lines = data.split("\n");
   //    var numLines = lines.length;
   //    for (var i=0; i < numLines; i++) {
   //       data = lines[i];  
   //       if( !data )  continue;
   //       if (data.charAt(0) != '#') {
   //          var values = data.split("\t");
   //          data = {
   //             chrom : values[0],
   //             pos   : values[1],
   //             id    : values[2],
   //             ref   : values[3],
   //             alt   : values[4],
   //             qual  : values[5],
   //             filter: values[6],
   //             info  : values[7]
   //          };
   //          if (data) socket.emit( 'results', { data : data });
   //       }
   //    }
   // }
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
