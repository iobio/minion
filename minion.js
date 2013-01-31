
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
   
   // app.get("/", function(req, res, next) {
   //     next("Could not find page");
   //     console.log(req.query);
   // });
   
   app.get('/', function (req, res) {
     res.sendfile(__dirname + '/minion.html');
   });
       
   return app;
}

module.exports.tool = undefined;
module.exports.addTool = function(newTool){ this.tool = newTool };

module.exports.listen = function(io) {
   io.sockets.on('connection', function (socket) {      
      var minionClient = require('./public/js/minion-client');
      socket.on('run', function (params) {

         var spawn = require('child_process').spawn;
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
         socket.emit('start');

         console.log('ARRRRRRRG = ' + args);
         console.log(module.exports.tool.path + ' ' + args);
         
         // spawn tool as new process
         var prog = spawn(module.exports.tool.path, args);        
         
         // handle minion sources
         for ( var j=0; j < minions.length; j++ ) {
                        
              var ioClient = require('socket.io-client');
              var source = minionClient.url.parse( minions[j] );
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





