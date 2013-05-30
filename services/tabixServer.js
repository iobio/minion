#!/usr/bin/env node

// temporary until i understand why freebayes seg faults on the stream
process.on('uncaughtException', function (exception) {
   // handle or ignore error
});

var minion = require('../minion/minion'),
    http = require('http'),
    app = minion(),
    server = http.createServer(app);
    

// setup socket
var io = require('socket.io').listen(server);

// start server
server.listen(7090);

// define tool
var tool = {
   apiVersion : "0.1",
   name : 'tabix',
   path: '/Users/chase/Tools/tabix-0.2.6/tabix',
   json : function(line) { 
      if( line[line.length-1] == "\n" ) line = line.slice(0,-1);
      var fields = line.split("\t");
      if (line && line.charAt(0) != '#') {
         return JSON.stringify(
            { 
               data : {
                chrom    : fields[0],
                pos      : fields[1],
                id       : fields[2],
                ref      : fields[3],
                alt      : fields[4],
                qual     : fields[5],
                filter   : fields[6],
                info     : fields[7],
                format   : fields[8],
                genotypes: fields.slice(9, fields.length)
               }
            }
         );
      } else if(line.slice(0,6) == "#CHROM") 
         return JSON.stringify( {header: { samples : fields.slice(9, fields.length) } } );
   }
};

// add tool to minion server
minion.addTool(tool);

// start minion socket
minion.listen(io);
