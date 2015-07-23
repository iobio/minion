#!/usr/bin/env node

var port = 8060,
    minion = require('../index.js')(port);    

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'samtools',   
   path: 'samtools',
   args: ['-'],
   // instructional data used in /help
   description : 'utility for manipulating sam formate files',
   exampleUrl : ""
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);