
var server = module.exports = {};

server.init = function(port) {        
    var express = require('express'),
        app = express(),
        http = require('http'),        
        server = http.createServer(app),
        BinaryServer = require('binaryjs').BinaryServer,
        self = this

    self.config = require('./config');
    self.bs = BinaryServer({server: server});
    self.app = app;
    self.server = server;

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
            if(command.init(self.tool, req.query)) {
                command.run(res, self.getClients(), self.server.address().address + ':' + self.server.address().port);
            }
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
        client.on('stream', function(stream,options) {  
            // handle params
            var urlParser = require('./utils/utils').parseUrlParams;
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
                command.on('error', function(error) {                                   
                    stream.error(self.tool.name + ' Error: ' + error);
                })
                command.on('log', function(msg) {
                    // Log message
                    console.log(msg);
                    // if debugging send msg to client                                      
                    if (self.debug) {
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
                // Initialize command
                if (command.init(self.tool, params)) {
                    // Run command
                    self.getServerAddress(function(serverAddress) {
                        command.run(stream, self.getClients(),serverAddress );            
                    });
                }
             }
        })
        client.on('close', function() {
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

server.close = function() {
    this.server.close();
}



module.exports = server;
