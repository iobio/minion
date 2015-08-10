var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    shortid = require('shortid');

// run command
var cmd = function(){}

// inherit eventEmitter
inherits(cmd, EventEmitter);

cmd.prototype.init = function(tool, params) {      
    // Call EventEmitter constructor
    EventEmitter.call(this);
    
    var self = this;
    
    this.tool = tool;
    this.minions = [];
    var rawArgs = [];
    var args = [];   
    var binPath = require('path').resolve(__dirname, '../bin/');
    var path = require('path').resolve(binPath, tool.path);
    var isDirectory = false;
    
    // test if directory
    if ( tool.path[ tool.path.length -1 ] == '/' )
        var isDirectory = true;   

    var cmd = params['cmd'];   
    // split commands by space into array, while escaping spaces inside double quotes    
    if (cmd != undefined) rawArgs = cmd.match(/(?:[^\s"]+|"[^"]*")+/g)

    // look for minion remote sources
    for( var i=0; i < rawArgs.length; i++) {
        var arg = rawArgs[i];                       
        if ( arg.match(/^http%3A%2F%2F\S+/) || arg.match(/^ws%3A%2F%2F\S+/) || arg.match(/^https%3A%2F%2F\S+/) || arg.match(/^wss%3A%2F%2F\S+/) ) {               
            self.minions.push( decodeURIComponent(arg) );               
            var inOpt = tool.inputOption;
            if( inOpt != undefined && inOpt == args[args.length-1]) {
                args.splice(-1);
            }
        }
        else if ( arg.match(/^[\'\"]http.*[\'\"]$/) )                                                                                              
            args.push( encodeURI(arg.slice(1,arg.length-1)) ); // remove quotes and reEncode since it's a url                                    
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
    if (tool.options != undefined)
        args = tool.options.concat( args );
    
    // add default arguments of tool
    if (tool.args != undefined)
        args = args.concat( tool.args );

    // check that executable path is in bin sandbox for security
    var IsThere = require("is-there");
    var resolvedPath = require("path").resolve(path);         
    if ( binPath != resolvedPath.substr(0, binPath.length) ) {           
        var error = "Program path not in executable directory. Only programs in iobio/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;
    } else if( !IsThere(resolvedPath) ) {        
        var error = "Program not found. Only programs in iobio/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;   
    }
    self.path = path;
    self.args = args;
    self.params = params;    
    return true;
}

cmd.prototype.run = function(stream, clients, serverAddress) {    
    var self = this,
        spawn = require('child_process').spawn;

    // spawn tool as new process    
    self.emit('log', 'command: ' + self.path + ' ' + self.args);
    var prog = spawn(self.path, self.args);
    
    if(self.params.parseByLine || self.params.format != undefined) {
        var utils = require('./utils/utils')
        var reader = self.params.parseByLine ? utils.lineReader : utils.chunkReader
        reader(prog, function(data) {
            var fs = require('fs');
            if (self.params.format != undefined) {
                if (self.tool[self.params.format] == undefined) {                     
                    stream.write( data );
                } else
                    stream.write( self.tool[self.params.format](data) )
            } else {
                stream.write( data );
            }
        });
    } else {   
        if(self.params.encoding != 'binary') prog.stdout.setEncoding(self.params.encoding);        
        prog.stdout.pipe(stream);      
        // if (self.cmdArgs.debug) {
        //   var fs = require('fs');
        //   var ws = fs.createWriteStream('toMinionServer.txt')
        //   prog.stdout.pipe(ws);
        // }
    }

    // go through minion sources
    self.minions.forEach(function(minion) {        
        var parsed = require('./utils/utils').parseUrlParams(minion)        
        // get correct protocol
        if (self.params.protocol == 'websocket')
            var Runner = require('./protocol/ws');
        else if (self.params.protocol == 'http')
            var Runner = require('./protocol/http');        
        if (parsed.isClient) {            
            if (self.params.protocol == 'http') { self.emit('error', "trying to use http to read data from browser/client (e.g. local files). Must use websocket")}
            var id = shortid.generate();
            self.emit('createClientConnection', {'id':id, 'serverAddress': serverAddress}, self);            
            self.on('clientConnected', function(clientStream) {                
                var runner = new Runner();
                runner.on('error', function(error) { self.emit('error', error); });
                runner.run(minion, prog, {stream:clientStream});
            })
        } else {

            // execute minion commands
            var runner = new Runner();
            // runner.on('error', function(error) { stream.error(error); });
            runner.on('error', function(error) { self.emit('error', error); });        
            runner.on('createClientConnection', function(connection) { self.emit('createClientConnection', connection); });
            runner.on('log', function(msg) { self.emit('log', msg); });
            runner.run(minion, prog);
        }
    })            

    prog.stderr.on('data', function (error) {            
        self.emit('error', 'stderr - ' + error);  
    });

    prog.on("close", function() {
        stream.end();
    })    

    prog.stdin.on('error', function() {        
        self.emit('error', 'error writing to program. possibly unconsumed data in pipe');
    })

    prog.on('error', function(err) {              
        self.emit('error', 'prog threw an error - ' + err);
    })

    prog.on('exit', function (code) {
        if (code !== 0) {
            var error = 'prog process exited with code ' + code         
            self.emit('error', error);         
        } else {
            stream.end();
        }
    }); 
}

module.exports = cmd;