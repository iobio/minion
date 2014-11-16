#!/usr/bin/env node

// initialize server
var minion = require('../minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app),
    BinaryServer = require('binaryjs').BinaryServer,
    port = 7062;
    
// process command line options
process.argv.forEach(function (val, index, array) {
  if(val == '--port' && array[index+1]) port = array[index+1];
});    

// setup socket
var bs = BinaryServer({server: server});

// start server
server.listen(port);


// define tool
tool = {
    apiVersion :  "0.1",
    name :        'vcf read depther',
    path :        'vcfReadDeptherHelper.sh',
    description : 'quickly approximates variant density by reading tabix index file associated with a gzipped vcf',
    exampleUrl :  "vcfReadDepther -i example.gz.vcf.tbi"
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(bs);
console.log('iobio server started on port ' + port);