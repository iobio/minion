
var server = module.exports = {};
var utils = require('./utils/utils');

server.init = function(port, opts) {
    var express = require('express'),
        app = express(),
        http = require('http'),
        server = http.createServer(app),
        BinaryServer = require('binaryjs').BinaryServer,
        self = this;

    opts = opts || {};

    self.config = opts.config ? require(process.cwd() + '/' + opts.config) : require('./config');    
    self.bs = BinaryServer({server: server});
    self.app = app;
    self.server = server;
    self.runningCommands = {}; // keep track of running commands   
    self.queue = []; // queue for catching overflow commands
    self.serverDebug = false;
    
    if (process.argv.indexOf('--debug') != -1)  self.serverDebug = true;        

    server.listen(port);

    // keep track of connected clients
    self.clients = {};

    // command line arguments
    self.cmdArgs = { debug : false}
    if (process.argv.indexOf('--debug') != -1) self.cmdArgs.debug = true;
    if (process.argv.indexOf('--platform') != -1) self.config.platform = process.argv[process.argv.indexOf('--platform')+1];
    console.log('platform = ' + self.config.platform);
            
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
        var compiled = ejs.compile(fs.readFileSync(__dirname + '/template/help.ejs', 'utf8'));
        self.tool['serviceUrl'] = fullUrl;
        var html = compiled( self.tool );
        res.send(html);
    });

    // handle http requests
    app.get('/', function (req, res) {        
        if(req.query.cmd == undefined) {
            // return instructions for empty commands
            var fs = require("fs");
            var ejs = require("ejs");
            var fullUrl = req.protocol + "://" + req.get('host');
            var compiled = ejs.compile(fs.readFileSync(__dirname + '/template/help.ejs', 'utf8'));
            self.tool['serviceUrl'] = fullUrl;
            var html = compiled( self.tool );
            res.send(html);
        } else {
            // execute command
            res.writeHead(200, {
                "Content-Type": 'text/plain',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            });        

            if(req.query.binary) req.query.encoding = 'binary';
            req.query.protocol = req.query.protocol || 'http';  
            self.debug = req.query.debug || false;

            var Command = require('./cmd.js');
            var command = new Command()            
            command.on('error', function(error) {
                console.log(self.tool.name + ' Error: ' + error);
                // stream.error(self.tool + ' Error: ' + error); // how do you pass errors up the http chain?
            })     
            command.on('createClientConnection', function(connection, command) {
                // bubble up createClientConnection with http?
                console.log("Attempting to use local file with http protocol. Must use websocket protocol")
            }); 
            command.on('log', function(msg) {
                // log message
                console.log(msg);
                // if debugging send msg to client
                // if (self.debug) // can't send back via http
                //     stream.error(self.tool.name + 'Debug: ' + msg)
            })            
            command.on('exit', function() {
                delete self.runningCommands[this.id];
                // run queue if present
                if (self.queue.length > 0) {
                    var nextCmd = self.queue.shift();
                    self.runningCommands[nextCmd.id] = nextCmd;
                    nextCmd.run(res, self.getClients(), self.server.address().address + ':' + self.server.address().port);
                }

            })

            var cachePath = self.getCachePath(self.config.cacheDir, req.query);
            self.canRunNow(null, cachePath, function(canRun, cacheReadStream) {
                // initialie command                    
                var cmdInitialized = command.init(self.tool, res, req.query, {'cachePath': cachePath});
                if (canRun) {                        
                    // Initialize command
                    if ( cmdInitialized ) {      
                        // if cached 
                        if (cacheReadStream) {
                            if (self.serverDebug) console.log('cached')
                            if(params.encoding != 'binary') cacheReadStream.setEncoding(params.encoding);        
                            cacheReadStream.pipe(stream);
                        } else {               
                            // Run command                                                       
                            self.runningCommands[command.id] = command;
                            command.run(self.getClients(), self.server.address().address + ':' + self.server.address().port);
                        }
                    }     
                } else {
                    if ( cmdInitialized ) {
                        self.queue.push(command);
                        // can't broadcast to client
                    }
                    if (self.serverDebug)
                        console.log('Adding to queue. length = ' + self.queue.length);    
                }
            })                        
        }
    });
        
    return this;
}

// handle websocket requests
server.listen = function(tool) {  
    
    var self = this;
    self.tool = tool;
    var bs = self.bs;     
    bs.commands = {};    
    bs.on('connection', function(client, options) {        
        self.client = client;         
        client.commands = [];           
        client.on('stream', function(stream,options) {              
            // handle params
            var urlParser = utils.parseUrlParams;
            var params = options.params || {};              
            if (params['cmd'] == undefined && params['url'] != undefined) {
                var q = urlParser(params['url']).query;      
                for (var attr in q) { params[attr] = q[attr]; } // merge params in query into params object        
            }            
            self.debug = params.debug || false;
            if (params.getNodeUrl) {
                self.getServerAddress(function(serverAddress) {                    
                    // pass serverAddress to client
                    stream.createClientConnection({id:null, 'serverAddress':serverAddress});                    
                })
            }

            stream.on('err', function(err) {
                console.log('caught stream error: ' + err);
                stream.error(self.tool.name + 'Caught Stream Error: ' + err)
            })
            if(options.event == "clientConnected") {                   
                var dataCommand = bs.commands[options.connectionID];
                dataCommand.emit('clientConnected', stream);
            }
            if(options.event == "setID") {
                client.connectionID = options.connectionID;    
                self.clients[options.connectionID] = client.id;   
            }
            if(options.event == 'run') {                                  
                params.protocol = params.protocol || 'websocket';                                                                                       
                if (params.binary) {params.encoding = 'binary';} // backwards compatibility fix
                params.encoding = params.encoding || 'utf8';
                
                var Command = require('./cmd.js');
                var command = new Command();
                client.commands.push(command);
                command.on('error', function(error) {                                   
                    stream.error(self.tool.name + ' Error: ' + error);
                })
                command.on('log', function(msg) {
                    // Log message
                    console.log(msg);
                    // if debugging send msg to client                                      
                    if (self.debug || self.serverDebug) {
                        console.log('In Debug Mode')
                        stream.error(self.tool.name + 'Debug: ' + msg)
                    }
                })
                command.on('createClientConnection', function(connection, command) {                         
                    // Pass event up stream            
                    stream.createClientConnection(connection);
                    // Set id
                    client.connectionID = connection.id;    
                    self.clients[connection.id] = client.id;                     
                    bs.commands[connection.id] = command;
                }) 
                command.on('exit', function() {
                    delete self.runningCommands[this.id];
                    // run queue if present                    
                    if (self.queue.length > 0) {                        
                        self.getServerAddress(function(serverAddress) {                                                     
                            var nextCmd = self.queue.shift();          
                            self.broadcast('queue', JSON.stringify(self.getQueueHash()) );                  
                            self.runningCommands[nextCmd.id] = nextCmd;
                            nextCmd.run(stream, self.getClients(),serverAddress );            
                        });
                    }

                })                                

                // check if command can be run now or should be put in the queue   
                var cachePath = self.getCachePath(self.config.cacheDir, params);
                self.canRunNow(client.domain, cachePath, function(canRun, cacheReadStream) {
                    // initialie command                    
                    var cmdInitialized = command.init(self.tool, stream, params, {'cachePath': cachePath});
                    if (canRun) {                        
                        // Initialize command
                        if ( cmdInitialized ) {      
                            // if cached 
                            if (cacheReadStream) {
                                if (self.serverDebug) console.log('cached')
                                if(params.encoding != 'binary') cacheReadStream.setEncoding(params.encoding);        
                                cacheReadStream.pipe(stream);
                            } else {       
                                // Check if trying to run cache and if so send error
                                if (cachePath) command.emit('error', "cacheWarning: Cache file '" + cachePath + "' does not exist. Running and caching now")
                                // Run command                                                       
                                self.getServerAddress(function(serverAddress) {
                                    self.runningCommands[command.id] = command;                            
                                    command.run(self.getClients(),serverAddress );            
                                });
                            }
                        }     
                    } else {
                        if ( cmdInitialized ) {
                            self.queue.push(command);
                            self.broadcast('queue', JSON.stringify(self.getQueueHash()) );
                        }
                        if (self.serverDebug)
                            console.log('Adding to queue. length = ' + self.queue.length);    
                    }
                })                                                
             }
        })
        client.on('close', function() {
            // close all connected commands;            
            client.commands.forEach(function(command) {                
                command.end();
            })

            // remove client from client list
            var connectionID;
            var clients = self.clients;
            for (var c in clients) { if (clients[c] = client.id) connectionID = c; } {
                delete self.clients[connectionID];
                delete bs.commands[connectionID];
            }
        })
    });
};

server.getBrowserClient = function(minion) {
    if (minion.query.id != undefined) {
        var bs = this.bs;              
        var clientId = this.clients[source.query.id];
        var client = bs.clients[clientId];            
    } else {
        var client = this.client;
    }

    return client;
}

server.getClients = function() {
    var clients = {};
    var self = this;
    Object.keys(this.clients).forEach(function(queryId) {
        var clientId = self.clients[queryId];
        clients[queryId] = self.bs.clients[clientId];
    })

    return clients;
}

server.getServerAddress = function(callback) {
    var self = this;
    var method = this.config.platform;
    if ( method == 'default') 
        callback(null);
    else if ( method == 'amazon') {
        var http = require("http");
        http.get('http://169.254.169.254/latest/meta-data/public-hostname', function(res) {
            res.on('data', function (chunk) {      
                var hostname = chunk.toString('utf8').split('compute-1.amazonaws.com')[0] + 'iobio.io';             
                callback(hostname + '/' + self.tool.name);
            });
        })
    }
}

// broadcast message to all clients on all streams
server.broadcast = function(event, msg) {    
    var event = event || 'message'    
    for ( var clientId in this.bs.clients) {        
        var client = this.bs.clients[clientId];
        for ( var streamId in client.streams) {
            var stream = client.streams[streamId];            
            stream.message(event, msg);
        }        
    }
}

server.getQueueHash = function() {
    var hash = {}
    if (this.serverDebug) console.log('queue.length = ' + this.queue.length)    

    this.queue.forEach(function(command) {
        if (this.serverDebug) console.log('queued command = ' + command.stream.guid + ':' +command.params);
        hash[command.stream.guid] = command.params        
    })

    return hash;
}

server.canRunNow = function(requestDomain, cachePath, callback) {
    var self = this;
    if (this.serverDebug)
        console.log('number of running commands: ' + Object.keys(this.runningCommands).length)

    // check if request is already cached
    this.getCacheReadStream(cachePath, function(readstream) {
        if (readstream) callback(true, readstream);  
        else {
            // check other ways to run it

            // check if max concurrent commands is defined
            var mcc = self.config.maxConcurrentCommands;    
            if(mcc == undefined || mcc == null)
                callback(true);    

            // check if requesting domain is listed as a domain not to be queued    
            else if (self.config.noQueueDomains.indexOf(requestDomain) != -1)
                callback(true);                    

            // check if we are over the max concurrent commands
            else if (Object.keys(self.runningCommands).length < self.config.maxConcurrentCommands)
                callback(true);
            else
                callback(false);
        }      
    })
}

server.getCacheReadStream = function(cachePath, callback) {      
    if (cachePath == null) callback(null)
    else {
        // read cached results if present
        var fs = require('fs');    
        var rs = fs.createReadStream(cachePath);
        rs.on('open', function() { 
            callback(rs);
        })

        // if cached file doesn't exist then readstream will error    
        rs.on('error', function(err) { 
            var error = "cacheError: Cache file '" + cachePath + "' does not exist";
            self.emit('log', error);
            self.emit('error', error);
            callback(null);
        })
    }
}

server.getCachePath = function(cacheDir, params) {
    var self = this;    
    // check if opts.cacheDir is set
    if ( !cacheDir) return null;
    
    // get cache directory
    cacheDir = utils.functor(cacheDir)(params); 

    // check if cache directory and cache path from client are set
    if ( !cacheDir || !params.cache ) return null;

    // check if cache directory is in the correct directory
    var dirPath = require("path").resolve(cacheDir);
    var resolvedPath = require("path").resolve(cacheDir + '/' +  params.cache);
    if ( dirPath != resolvedPath.substring(0,dirPath.length) ) {
        var error = "cacheError: Cache directory invalid. Can only cache files in the specified cacheDir";
        self.emit('log', error);
        self.emit('error', error);
        return null;
    }
    
    return resolvedPath;
}

server.close = function() {
    this.server.close();
}



module.exports = server;
