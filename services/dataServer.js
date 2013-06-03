#!/usr/bin/env node

// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    port = 8090;
    
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
   name : 'cat',
   path :  'cat',
   send : function(socket, data) {
      socket.emit( 'results', { 
         data : new Buffer(data, 'binary').toString('base64'),
         options : { convert: {from:'base64', to:'binary'} }
      });
   } 
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);