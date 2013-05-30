#!/usr/bin/env node

// temporary until i understand why freebayes seg faults on the stream
// process.on('uncaughtException', function (exception) {
//    // handle or ignore error
// });

var minion = require('../minion/minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app);
    

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(8000);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'gds2pca',
   path: '/Users/chase/Tools/snpRelate/pca.R',
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
   
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
