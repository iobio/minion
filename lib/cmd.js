var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

// run command
var cmd = function(tool, params) {      
    // Call EventEmitter constructor
    EventEmitter.call(this);
    
    var minionClient = require('./minion-client'),
        self = this;
    
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
        if ( arg.match(/^http%3A%2F%2F\S+/) || arg.match(/^ws%3A%2F%2F\S+/) || arg.match(/^https%3A%2F%2F\S+/) || arg.match(/^wss%3A%2F%2F\S+/) ) {   
            console.log('mArg = ' + arg);
            self.minions.push( decodeURIComponent(arg) );   
            // if (self.cmdArgs.debug) { console.log('remote source url = ' + decodeURIComponent(arg))}      
            var inOpt = tool.inputOption;
            if( inOpt != undefined && inOpt == args[args.length-1]) {
                args.splice(-1);
            }
        }
        else if ( arg.match(/^[\'\"].*[\'\"]$/) )
            args.push( encodeURI(arg.slice(1,arg.length-1)) ); // remove quotes and reEncode in case it's a url
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


    
    // // send start event
    // if (options.start != undefined) options.start();
      
    // check that executable path is in bin sandbox for security
    var resolvedPath = require("path").resolve(path);
    console.log('binPath = ' + resolvedPath);
    // console.log('rpath = ' + resolvedPath.substr(0, binPath.length);
    if ( binPath != resolvedPath.substr(0, binPath.length) ) {   
        var error = "command not found or program not in executable directory. Only programs in iobio/bin/ directory are executable";
        console.log(error);
        self.emit('error', error);
        return; // return and do not execute command if outside bin sandbox
    }
    self.path = path;
    self.args = args;
    self.params = params;
}

// inherit eventEmitter
inherits(cmd, EventEmitter);



cmd.prototype.run = function(stream, clients) {
    
    var self = this,
        spawn = require('child_process').spawn;

    // spawn tool as new process
    console.log('command: ' + self.path + ' ' + self.args);    
    var prog = spawn(self.path, self.args);
    
    if(self.params.parseByLine || self.params.format != undefined) {
        var reader = require('./utils/reader')
        var reader = self.params.parseByLine ? reader.lineReader : reader.chunkReader
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
        var browserClient;        
        var parsed = require('./minion-client').url.parse(minion)
        if (parsed.isClient) {            
            browserClient = clients[parsed.query.id];
        }

        // get correct protocol
        if (self.params.protocol == 'websocket')
            var Runner = require('./protocol/ws');
        else if (self.params.protocol == 'http')
            var Runner = require('./protocol/http');

        // execute minion commands
        var runner = new Runner();
        runner.on('error', function(error) { stream.error(error); });
        runner.run(minion, prog, {client:browserClient});
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