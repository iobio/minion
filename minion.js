module.exports = function() {
   var express = require('express'),
       app = express();
       
   // add status service
   app.get('/status', function(req, res){
     res.header('Content-Type', 'application/json');
     res.header('Charset', 'utf-8')
     res.send(req.query.callback + '({"status": "running"});');
   });
       
   return app;
}

module.exports.tool = undefined;
module.exports.addTool = function(newTool){ this.tool = newTool };

module.exports.listen = function(io) {
   io.sockets.on('connection', function (socket) {
         // socket.emit('news', { hello: 'server talking!'});
      socket.on('run', function (params) {

         var spawn = require('child_process').spawn;
         var minions = [];
         var rawArgs = [];
         var args = [];
         if (params['cmd'] != undefined) rawArgs = params['cmd'].split(" ");

         // look for minion remote sources
         rawArgs.filter( function(arg) { 
            if ( arg.match(/^http:\/\/\S+/) ) {
               console.log('mArg = ' + arg);
               minions.push( decodeURI(arg) );
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
         socket.emit('start');

         console.log('ARRRRRRRG = ' + args);
         console.log(module.exports.tool.path + ' ' + args);
         
         // spawn tool as new process
         var prog = spawn(module.exports.tool.path, args);        
         
         // handle minion sources
         for ( var j=0; j < minions.length; j++ ) {
                        
              var ioClient = require('socket.io-client');
              var source = module.exports.url.parse( minions[j] );
              console.log('host = ' + source.host);
              var clientSocket = ioClient.connect( source.host );

              
              console.log('query = ' + source.query.cmd);
              
              clientSocket.emit('run', source.query);

              clientSocket.on('results', function(args) {
                 var data = args.data,
                     options = args.options;
                     
                 if (options && options.convert)  {
                    prog.stdin.write( new Buffer(data, options.convert.from).toString(options.convert.to), options.convert.to );
                 }
                 else
                     prog.stdin.write( data );
              });
         }
         
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
               module.exports.tool.send(socket, data);
            });                        
         }

         prog.stderr.on('data', function (data) {
            console.log('prog stderr: ' + data);
         });

         prog.on('exit', function (code) {
            if (code !== 0) {
               console.log('prog process exited with code ' + code);
            }
         });
         

      });

   });
};

module.exports.sanitize = function(cmd) {
   // TODO
}

module.exports.url = {};

module.exports.url.parse = function(url) {
   var parsed = { query: {} };
   parsed.protocol = url.split('://')[0]
   console.log('parUrl = ' + url)
   var parts = url.split(/\?(.+)?/);
   parsed.host = parts[0];
   var urlParams = parts[1]
   console.log('parts1 = ' + urlParams);

   if (!urlParams || urlParams.length == 0) {return parsed}
   console.log('urlParams = ' + urlParams);
   var parameterPairs = urlParams.split('&');
   var x;
   for (x in parameterPairs) {
      var parameterPair = parameterPairs[x];
      console.log('parameterPair = ' + parameterPair);
      parameterPair = parameterPair.split(/=(.+)?/);
      parsed.query[parameterPair[0]] = parameterPair[1];
   }
   return parsed;   
}