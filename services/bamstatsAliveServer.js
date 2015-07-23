#!/usr/bin/env node
// Chase Miller 2013
// uses helper script to combine samtools and bamtools to 
// grab a region of mulitple bam files and merge
// samtools is used b\c it is quicker than bamtools at remote slices


var port = 7100;
    minion = require('../index.js')(port);    


// define tool
var tool = {
   apiVersion : "0.1",
   name : 'bamstatsAlive',
   path :  'bamstatsAlive',
   inputOption: '-fake',
   description : 'utility for bam files',
   exampleUrl : "fill in"
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);
