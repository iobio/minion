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
    port = 8030;
    
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
   path :  './iobio/helpers/bamHelper.sh',
   binary: true,
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);