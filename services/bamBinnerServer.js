#!/usr/bin/env node

// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
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
   name : 'bamtools',
   path :  './minion/helpers/bamBinnerHelper.sh',
   json: function(data) {
      data = String(data);
      var results = data.trim().split("\n")
      return JSON.stringify(results);
   }
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);