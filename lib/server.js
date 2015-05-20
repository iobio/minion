
var server = module.exports = {};

server.init = function(port) {    
    var express = require('express'),
        app = express(),
        http = require('http'),        
        server = http.createServer(app),
        BinaryServer = require('binaryjs').BinaryServer,
        self = this;

    self.bs = BinaryServer({server: server});
    self.app = app;
    self.server = server;

    server.listen(port);

    // keep track of connected clients
    self.clients = {};

    // command line arguments
    self.cmdArgs = { debug : false}
    if (process.argv.indexOf('--debug') != -1) self.cmdArgs.debug = true;
            
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
        
        console.log('req.query.cmd = ' + req.query.cmd );
        if(req.query.binary) req.query.encoding = 'binary';
        req.query.protocol = req.query.protocol || 'http';
        console.log('params = ' + JSON.stringify(req.query));
        // res.emit('error', 'hihi error');
        var Command = require('./cmd.js');
        var command = new Command(self.tool, req.query);
        command.run(res, self.getClients());               
        // command.on('error', function(err) {

        //     res.write('Error:' + err);
        //     res.send();
        // })
     }
    });
        
    return this;
}

// handle websocket requests
server.listen = function(tool) {    
    var self = this;
    self.tool = tool;
    var bs = self.bs;     
    bs.on('connection', function(client) {
        console.log('connected')
      self.client = client;        
      client.on('stream', function(stream,options) { 
         if(options.event == "setID") {
          client.connectionID = options.connectionID;    
          self.clients[options.connectionID] = client.id;   
        }
         if(options.event == 'run') {            
            var params = options.params;
            params.protocol = params.protocol || 'http';
            params.returnEvent = params.returneEvent || 'results';
            if (params.binary) {params.encoding = 'binary';} // backwards compatibility fix
            params.encoding = params.encoding || 'utf8';
            
            var Command = require('./cmd.js');
            var command = new Command(self.tool, params);
            command.run(stream, self.getClients());
            command.on('error', function(err) {
                stream.error(err);
            })
         }
      })
      client.on('close', function() {
        var connectionID;
        var clients = self.clients;
        for (var c in clients) { if (clients[c] = client.id) connectionID = c; }
        delete self.clients[connectionID];
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

server.close = function() {
    this.server.close();
}



module.exports = server;