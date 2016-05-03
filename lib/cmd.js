var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    shortid = require('shortid'),
    utils = require('./utils/utils');

// run command
var cmd = function(){}

// inherit eventEmitter
inherits(cmd, EventEmitter);

cmd.prototype.init = function(tool, stream, params, opts) {
    // Call EventEmitter constructor
    EventEmitter.call(this);

    var self = this;

    this.opts = opts;
    this.tool = tool;
    this.stream = stream;
    this.minions = [];
    this.id = params['id'] || shortid.generate();

    var rawArgs = [];
    var args = [];
    var binPath = require('path').resolve(__dirname, '../bin/');
    var path = require('path').resolve(binPath, tool.path);
    var isDirectory = false;

    // test if directory
    if ( tool.path[ tool.path.length -1 ] == '/' )
        var isDirectory = true;

    var cmd = params['cmd'];
    console.log('BIG CMD = ' + cmd)
    // split commands by space into array, while escaping spaces inside double quotes
    if (cmd != undefined) rawArgs = cmd.match(/(?:[^\s"]+|"[^"]*")+/g)

        console.log('rawArgs = ' + rawArgs);

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
        // else if ( arg.match(/^[\'\"]http.*[\'\"]$/) )
        //     args.push( encodeURI(arg.slice(1,arg.length-1)) ); // remove quotes and reEncode since it's a url
        else if ( arg.match(/^[\'\"].*[\'\"]$/) )
            args.push( arg.slice(1,arg.length-1) ); // remove quotes
        else
            args.push( arg );
    }

    console.log('args = ' + args);
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
        var error = "Program path not in executable directory. Only programs in minion/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;
    } else if( !IsThere(resolvedPath) ) {
        var error = "Program not found. Only programs in minion/bin/ directory are executable";
        self.emit('log', error);
        self.emit('error', error);
        return false;
    }
    self.path = path;
    self.args = args;
    self.params = params;
    return true;
}

cmd.prototype.params = undefined;

cmd.prototype.id = undefined;

cmd.prototype.run = function(clients, serverAddress) {
    var self = this,
        spawn = require('child_process').spawn,
        stream = this.stream;

    // spawn tool as new process
    self.emit('log', 'command: ' + self.path + ' ' + self.args);
    var prog = spawn(self.path, self.args);
    this.prog = prog;

    if(self.params.parseByLine || self.params.format != undefined) {
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
        // save output for future caching
        if (self.opts.cachePath) {
            self.emit('log', 'caching ' + self.opts.cachePath);
            var fs = require('fs');
            var mkdirp = require('mkdirp');
            var cacheDir = require('path').dirname(self.opts.cachePath)
            mkdirp( cacheDir , function (err) {if (err) console.error(err)});
            var ws = fs.createWriteStream(self.opts.cachePath + '.processing', {flags: 'wx', mode:0600})
            ws.on('error', function(error) {
                if (error.code != 'EEXIST')
                    console.error(error)
            })

            // Remove .processing extension from cache file when cache has finished being written
            ws.on('finish', function() {
                fs.rename(self.opts.cachePath + '.processing', self.opts.cachePath, function(err) {
                    if ( err ) console.error('ERROR Renaming Cache file: ' + err);
                })
            })

            // if tool has cacheTransform pipe through it before caching
            if(self.tool.cacheTransform)
                prog.stdout.pipe( self.tool.cacheTransform() ).pipe( ws );
            else
                prog.stdout.pipe( ws )
        }
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
            self.emit('createClientConnection', {'id':self.id, 'serverAddress': serverAddress}, self);
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
        self.runner = runner;
    })

    prog.stderr.on('data', function (error) {
        self.emit('log', 'stderr - ' + error);
        self.emit('error', 'stderr - ' + error);
    });

    prog.on("end", function() {
        self.emit('log', 'prog ended')
        stream.end();
    })
    prog.on("close", function() {
        self.emit('log', 'prog closed')
    })
    prog.stdin.on('error', function() {
        self.emit('error', 'error writing to program. possibly unconsumed data in pipe');
        self.emit('log', 'error writing to program. possibly unconsumed data in pipe');
    })

    prog.on('error', function(err) {
        self.emit('error', 'prog threw an error - ' + err);
        self.emit('log', 'prog threw an error - ' + err);
    })

    prog.on('exit', function (code) {
        if (code !== 0) {
            var error = 'prog process exited with code ' + code
            self.emit('error', error);
            self.emit('log', error);
            // remove cache
            self.deleteCache();
        }
        self.emit('log', 'prog exited')
        self.emit('exit', code);
    });
}

cmd.prototype.end = function() {
    // clean up command

    // close stream
    this.stream.end();
    if(this.prog) {
        this.prog.kill('SIGINT');
        if (this.prog.exitCode != 0 ) {
            this.emit('log', 'command prematurely ended. Cleaning up ...')
            this.deleteCache();
        }
    }
    this.emit('exit');

    // close upstream connections
    if (this.runner) this.runner.end();
}

cmd.prototype.deleteCache = function() {
    var self = this;

    if (self.opts.cachePath) {
        if (self.params.partialCache === 'true')
            self.emit('log', 'leaving partial cache: ' + self.opts.cachePath);
        else {
            self.emit('log', 'deleting cache: ' + self.opts.cachePath);
            var fs = require('fs');
            fs.unlink(self.opts.cachePath + '.processing', function() {});
            fs.unlink(self.opts.cachePath, function() {});
        }
    }
}

module.exports = cmd;
