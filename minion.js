
module.exports = function() {
   var express = require('express'),
       app = express();
       
       
   // add public folder
   app.use('/', express.static(__dirname + '/public'));
   
   // add status service
   app.get('/status', function(req, res){
     res.header('Content-Type', 'application/json');
     res.header('Charset', 'utf-8')
     res.send(req.query.callback + '({"status": "running"});');
   });
   

   // handle http requests
   app.get('/', function (req, res) {
     res.writeHead(200, {
       // "Content-Type": 'application/octet-stream'
       "Content-Type": 'text/plain'
     });
// res.write('hi');
// res.end();     
console.log('req.query.cmd = ' + req.query.cmd );

console.log('req.query.protocol = ' + req.query.protocol);
     req.query.protocol = req.query.protocol || 'http';
     module.exports.runCommand(
             req.query,
             {   data: function(data) {res.write(data);},
                 end:  function() {res.end() }
             }
          );
   });
       
   return app;
}

module.exports.tool = undefined;
module.exports.addTool = function(newTool){ this.tool = newTool };

// handle websocket requests
module.exports.listen = function(io) {
   io.sockets.on('connection', function (socket) {            
      socket.on('run', function (params) {
         params.protocol = params.protocol || 'websocket';
         module.exports.runCommand(
            params, 
            {  data: function(data) {
                        if (module.exports.tool.binary)
                           socket.emit( 'results', { data : new Buffer(data, 'binary').toString('base64'), options : { binary:true } });
                        else
                           socket.emit( 'results', { data : data } );
                     },
               start: function() { socket.emit('start'); },
               end: function() { socket.emit('end'); }
            }
         );
      });
   });
};

// run command
module.exports.runCommand = function(params, options) {      
   var spawn = require('child_process').spawn;
   var minionClient = require('./public/js/minion-client');
   var minions = [];
   var rawArgs = [];
   var args = [];
   var cmd = params['cmd'];
   if (cmd == undefined && params['url'] != undefined) cmd = minionClient.url.parse(params['url']).query.cmd;
   if (cmd != undefined) rawArgs = cmd.split(" ");

   // look for minion remote sources
   rawArgs.filter( function(arg) { 
      if ( arg.match(/^http:\/\/\S+/) ) {
         console.log('mArg = ' + arg);
         minions.push( arg );
      }
      else if ( arg.match(/^[\'\"]http:\/\/\S+[\'\"]$/) )
         args.push( arg.slice(1,arg.length-1) ); // remove quotes
      else
         args.push( arg );
   });
   
   // add default options of tool
   if (module.exports.tool.options != undefined)
      args = module.exports.tool.options.concat( args );
   
   // add default arguments of tool
   if (module.exports.tool.args != undefined)
      args = args.concat( module.exports.tool.args );
   
   // send start event
   if (options.start != undefined) options.start();

   console.log('ARRRRRRRG = ' + args);
   console.log(module.exports.tool.path + ' ' + args);
   
   // spawn tool as new process
   var prog = spawn(module.exports.tool.path, args);        
   
   // send requests to minion sources
   if (params.protocol == 'websocket')
      module.exports.websocketRequest(minions, prog)
   else if (params.protocol == 'http')
      module.exports.httpRequest(minions, prog)
   
   // if tool has pipe
   if (module.exports.tool.pipe != undefined) {
      var progPipe = spawn("bcftools", ["view", "-vcg", "-"]);
      progPipe.stdout.on('data', function(data) {
         module.exports.tool.send(socket, data);
      });
      prog.stdout.pipe(progPipe.stdin);            
      progPipe.stderr.pipe(process.stdout);
   } else { // no pipe 
      prog.stdout.on('data', function (data) {
         if (module.exports.tool.send != undefined) {
               options.data( module.exports.tool.send(data) )
         } else
            options.data( data );
      });                        
   }

   prog.stderr.on('data', function (data) {
      console.log('prog stderr: ' + data);
   });

   prog.on('exit', function (code) {
      if (options.end != undefined) options.end();
      if (code !== 0) {
         console.log('prog process exited with code ' + code);
      }
   }); 
}

module.exports.httpRequest = function(sources, prog) {
   var http = require('http');
   console.log('HHHTTTTTTTPPPPPPP');
   // handle minion sources
   for ( var j=0; j < sources.length; j++ ) {
                  
        
        var url = sources[j];
        console.log('url = ' + url);
        var req = http.request(url, function(res) {
            res.on('data', function(chunk) {
               prog.stdin.write( chunk );
            })
        });
        req.end();
   }
}

//
module.exports.websocketRequest = function(sources, prog) {
   var minionClient = require('./public/js/minion-client');
   console.log('WEBSOCKCKCKCKCKCKCKCK');
   // handle minion sources
   for ( var j=0; j < sources.length; j++ ) {
                  
        var ioClient = require('socket.io-client');
        var source = minionClient.url.parse( sources[j] );
        console.log('host = ' + source.host);
        var clientSocket = ioClient.connect( source.host );

        
        console.log('query = ' + source.query.cmd);
        
        clientSocket.emit('run', source.query);

        clientSocket.on('results', function(args) {
           var data = args.data,
               options = args.options || {};

           if (options.binary)  {
              prog.stdin.write( new Buffer(data, 'base64').toString('binary'), 'binary' );
           }
           else {
              prog.stdin.write( data );
            }
        });
   }  
}

module.exports.sanitize = function(cmd) {
   // TODO
}





