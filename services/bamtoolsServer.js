#!/usr/bin/env node
// Chase Miller 2013
// uses helper script to combine samtools and bamtools to 
// grab a region of mulitple bam files and merge
// samtools is used b\c it is quicker than bamtools at remote slices


// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    port = 7030;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});    

// setup socket
var io = require('socket.io').listen(server);

// set production environment
// io.enable('browser client minification');  // send minified client
// io.enable('browser client etag');          // apply etag caching logic based on version number
// io.enable('browser client gzip');          // gzip the file
// io.set('log level', 1);                    // reduce logging

// start server
server.listen(port);


// define tool
tool = {
   apiVersion : "0.1",
   name : 'bamtools',
   path :  'bamtools',
   inputOption: '-in',
   json: function(chunk) {
      var data = String(chunk);
      data = data.substr(0, data.length-1)
      data = data.replace(/\n/g, ",");
      data = data.replace(/\\/g, '\\\\' )
      data = "[" + data + "]"; 
      return data;
   },
   // instructional data used in /help
   description : 'utility for bam files',
   exampleUrl : "fill in"
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
