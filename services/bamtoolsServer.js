#!/usr/bin/env node
// Chase Miller 2013-2015

var port = 7030,
    minion = require('../index.js')(port);    

// define tool
var tool = {
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

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);