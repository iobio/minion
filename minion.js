
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
   
   // add status service
   app.get('/help', function(req, res){
     var fs = require("fs");
     var ejs = require("ejs");
     var fullUrl = req.protocol + "://" + req.get('host');
     var compiled = ejs.compile(fs.readFileSync(__dirname + '/help.ejs', 'utf8'));
     module.exports.tool['serviceUrl'] = fullUrl;
     var html = compiled( module.exports.tool );
     res.send(html);
   });   

   // handle http requests
   app.get('/', function (req, res) {
     if(req.query.cmd == undefined) {
        // return instructions for empty commands
        var fs = require("fs");
        var ejs = require("ejs");
        var fullUrl = req.protocol + "://" + req.get('host');
        var compiled = ejs.compile(fs.readFileSync(__dirname + '/help.ejs', 'utf8'));
        module.exports.tool['serviceUrl'] = fullUrl;
        var html = compiled( module.exports.tool );
        res.send(html);
     } else {
        // execute command
        res.writeHead(200, {
          "Content-Type": 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        });
        // console.log(req);
        console.log('req.query.cmd = ' + req.query.cmd );
        if(req.query.binary) req.query.encoding = 'binary';
        req.query.protocol = req.query.protocol || 'http';
        console.log('params = ' + JSON.stringify(req.query));
        module.exports.runCommand(res, req.query);
     }
   });
       
   return app;
}

module.exports.tool = undefined;
module.exports.addTool = function(newTool){ this.tool = newTool };

// handle websocket requests
module.exports.listen = function(bs) {
   module.exports.bs = bs;
   bs.on('connection', function(client) {
      module.exports.client = client;        
      client.on('stream', function(stream,options) { 
         if(options.event == "setID") client.connectionID = options.connectionID;
         if(options.event == 'run') {
            var params = options.params;
            params.protocol = params.protocol || 'http';
            params.returnEvent = params.returneEvent || 'results';
            if (params.binary) {params.encoding = 'binary';} // backwards compatibility fix
            params.encoding = params.encoding || 'utf8';
            module.exports.runCommand(stream, params);
         }
      })
   });
};

// run command
module.exports.runCommand = function(stream, params) {      
   var spawn = require('child_process').spawn,
       minionClient = require('./minion-client');
   var minions = [];
   var rawArgs = [];
   var args = [];   
   var binPath = require('path').resolve(__dirname, 'bin/');
   var path = require('path').resolve(binPath, module.exports.tool.path);
   var isDirectory = false;
   
   // test if directory
   if ( module.exports.tool.path[ module.exports.tool.path.length -1 ] == '/' )
      var isDirectory = true;   

   if (params['cmd'] == undefined && params['url'] != undefined) {
      var q = minionClient.url.parse(params['url']).query;
      for (var attr in q) { params[attr] = q[attr]; } // merge params in query into params object
   }
   var cmd = params['cmd'];
   // split commands by space into array, while escaping spaces inside double quotes
   console.log('cmad = ' + params['url']);
   if (cmd != undefined) rawArgs = cmd.match(/(?:[^\s"]+|"[^"]*")+/g)
   
   console.log("raw args = " + rawArgs);

   // look for minion remote sources
   for( var i=0; i < rawArgs.length; i++) {
      var arg = rawArgs[i];
      if ( arg.match(/^http%3A%2F%2F\S+/) || arg.match(/^ws%3A%2F%2F\S+/) ) {   
         console.log('mArg = ' + arg);
         minions.push( decodeURIComponent(arg) );         
         var inOpt = module.exports.tool.inputOption;
         if( inOpt != undefined && inOpt == args[args.length-1]) {
            args.splice(-1);
         }
      }
      else if ( arg.match(/^[\'\"].*[\'\"]$/) )
         args.push( arg.slice(1,arg.length-1) ); // remove quotes
      else
         args.push( arg );
   }
   
   // check if path is to a directory and if so remove
   // the first argument and append to path as program name
   if (isDirectory) {
       path += "/" + args.splice(0,1);
   }
   
   // add default options of tool
   if (module.exports.tool.options != undefined)
      args = module.exports.tool.options.concat( args );
   
   // add default arguments of tool
   if (module.exports.tool.args != undefined)
      args = args.concat( module.exports.tool.args );
   
   // // send start event
   // if (options.start != undefined) options.start();
      
   // check that executable path is in bin sandbox for security
   var resolvedPath = require("path").resolve(path);
   if ( binPath != resolvedPath.substr(0, binPath.length) ) {
      stream.write( "ERROR: command not found or program not in executable directory. Only programs in iobio/bin/ directory are executable" );
      stream.end();
      return; // return and do not execute command if outside bin sandbox
   }
  
   console.log('command: ' + path + ' ' + args);
   
   // spawn tool as new process
   var prog = spawn(path, args);        
   
   if(params.parseByLine || params.format != undefined) {
      // FIX this so it uses streams
      var reader = params.parseByLine ? module.exports.lineReader : module.exports.chunkReader
      reader(prog, function(data) {
            var fs = require('fs');
             if (params.format != undefined) {
                  if (module.exports.tool[params.format] == undefined) {
                     // ADD ERROR HANDLING - SEND ERROR HASH BACK TO CLIENT
                     // send raw data anyway
                     stream.write( data );
                  } else
                     stream.write( module.exports.tool[params.format](data) )
               } else {
                  stream.write( data );
               }
         });
   } else {   
      if(params.encoding != 'binary') prog.stdout.setEncoding(params.encoding);
      prog.stdout.pipe(stream);
   }

   
   // send requests to minion sources
   if (params.protocol == 'websocket')
      module.exports.websocketRequest(minions, prog)
   else if (params.protocol == 'http')
      module.exports.httpRequest(minions, prog)                

   prog.stderr.on('data', function (data) {
      console.log(module.exports.tool['name'] + ' ERROR: ' + data);
   });

   prog.on("close", function() {
      stream.end();
   })

   prog.on('exit', function (code) {
      if (code !== 0) {
         console.log('prog process exited with code ' + code);
      }
   }); 
}

module.exports.httpRequest = function(sources, prog) {
   var http = require('http');

   // handle minion sources
   for ( var j=0; j < sources.length; j++ ) {                
        var url = sources[j];
        if (url.slice(0,2) == "ws") url = "http://" + url.split(/^ws:\/\//)[1];
        var req = http.request(url, function(res) {           
            res.on('data', function(chunk) {
               prog.stdin.write( chunk );
            })
            res.on('end', function () {
               // might need ?
               prog.stdin.end();
            });
        });
        req.end();
   }
}

//
module.exports.websocketRequest = function(sources, prog) {
   var minionClient = require('./minion-client');
   var BinaryClient = require('binaryjs').BinaryClient;

   // handle minion sources
   for ( var j=0; j < sources.length; j++ ) {
                  
        // var ioClient = require('socket.io-client');
        var source = minionClient.url.parse( sources[j] );
        if(source.isClient) {
           if (source.query.id != undefined) {
              var bs = module.exports.bs;
              var client;
              for ( var c in bs.clients) {
                 if(bs.clients[c].connectionID == source.query.id)
                    client = bs.clients[c];
              }              
            } else {
               var client = module.exports.client;
            }
            var ustream = client.createStream({event:'run', params: source.query });
            ustream.pipe(prog.stdin);
            ustream.on('end', function() { 
               prog.stdin.end() 
            })
         }
        else {
            var upstreamClient = new BinaryClient(source.host);
            upstreamClient.on("open", function() {
               var ustream = upstreamClient.createStream({event:'run', params: source.query });
               ustream.pipe(prog.stdin);  
               ustream.on("end", function() {
                  // close stream
                  prog.stdin.end();
               })            
            });
         }
   }  
}

module.exports.lineReader = function(prog, callback) {
   var rl = require('readline').createInterface({
     input: prog.stdout,
     terminal: false
   });
   
   rl.on('line', function (line) {
      callback(line);
   });
   
}

module.exports.chunkReader = function(prog, callback) {
   prog.stdout.on('data', function (chunk) {
        callback(chunk);
      });
}

module.exports.sanitize = function(cmd) {
   // TODO
}





