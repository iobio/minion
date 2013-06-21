#!/usr/bin/env node

// temporary until i understand why freebayes seg faults on the stream
// process.on('uncaughtException', function (exception) {
//    // handle or ignore error
// });

var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    port = 8000;
    
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
   name : 'gds2pca',
   path: 'gdsHelper.sh',
   json: function(data) {
      if( data[data.length-1] == "\n" ) data = data.slice(0,-1);
      var samples = data.split("\t");
      // console.log(JSON.stringify(samples));
      var results = []; 
      for (var i=0; i < samples.length; i++) {
         var s = samples[i].split(",");
         results.push([ parseFloat(s[0]), parseFloat(s[1]), s[2] ]);
      }
      return JSON.stringify(results);
   },
   // instructional data used in /help
   description : 'performs fast pca on the .gds format which is used by the SNPRelate R package',
   exampleUrl : ""
   
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
