#!/usr/bin/env node

// initialize server
var minion = require('./minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app);    

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(8020);


// define tool
tool = {
   apiVersion : "0.1",
   name : 'bamtools',
   path :  '/Users/chase/Desktop/tmp_workspace/minion/bamHelperJson.sh',
   send: function(data) {
      data = String(data);
      var results = data.trim().split("\n")
      return JSON.stringify(results);
   }
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);