#!/usr/bin/env node


var port = 8021,
    minion = require('../index.js')(port);    ;
    
// define tool
tool = {
    apiVersion : "0.1",
    name : 'bam read depther',
    path :  'bamReadDeptherHelper.sh',
    description : 'quickly approximates read depth coverage data using the bai index file associated with a bam',    
    exampleUrl : "to add"
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);