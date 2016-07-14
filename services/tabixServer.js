#!/usr/bin/env node

var port = 7090,
    minion = require('../index.js')(port);
    // lastRecord = require('last-record-stream');

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'tabix',
   path: 'tabix',
   // cacheTransform: lastRecord
};


// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);