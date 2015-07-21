
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
        
        var Command = require('./cmd.js');
        var command = new Command(self.tool, req.query);
        command.on('error', function(error) {
            console.log(self.tool.name + ' Error: ' + error);
            // stream.error(self.tool + ' Error: ' + error); // how do you pass errors up the http chain?
        })        
        command.run(res, self.getClients(), self.server.address().address + ':' + self.server.address().port);               
        // command.on('error', function(err) {
        //     console.log('ser verrorr catch');
        //     // res.write('Error:' + err);
        //     // res.send();
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
    bs.commands = {};    
    bs.on('connection', function(client, options) {
      console.log('connected')
      console.log('options = ' + options);
      self.client = client;      
      client.on('stream', function(stream,options) { 
        console.log('streamoptions = ' + options);
         stream.on('err', function(err) {
            console.log('caught stream error: ' + err);
         })
        if(options.event == "clientConnected") {
          console.log('got clientConnected')
          // var dataCommand = self.getClients()[options.connectionID]
          console.log('bs.commands = ' + bs.commands);
          var dataCommand = bs.commands[options.connectionID];
          dataCommand.emit('clientConnected', stream);
        }
         if(options.event == "setID") {
          client.connectionID = options.connectionID;    
          self.clients[options.connectionID] = client.id;   
        }
         if(options.event == 'run') {            
            var params = options.params;            
            params.protocol = params.protocol || 'websocket';            
            params.returnEvent = params.returneEvent || 'results';
            if (params.binary) {params.encoding = 'binary';} // backwards compatibility fix
            params.encoding = params.encoding || 'utf8';
            
            var Command = require('./cmd.js');
            var command = new Command(self.tool, params);
            command.on('error', function(error) {                
                stream.error(self.tool.name + ' Error: ' + error);
                // stream.createClientConnection('my man');
            })
            command.on('createClientConnection', function(connection, command) {
              // pass event up stream
              stream.createClientConnection(connection);
              // set id
              client.connectionID = connection.id;    
              self.clients[connection.id] = client.id;               
              bs.commands[connection.id] = command;
            })
            command.run(stream, self.getClients(), self.getServerAddress());            
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

server.getServerAddress = function() {
  // return this.server.address().address + ':' + this.server.address().port;

  var http = require("http");
  http.get('http://169.254.169.254/latest/meta-data/public-hostname', function(res) {
    res.on('data', function (chunk) {      
      var hostname = chunk.replace('compute-1.amazonaws.com', 'iobio.io');
      return hostname;
    });
  })

  // var options = {
  //   host: '169.254.169.254/latest/meta-data/public-hostname',
  //   port: 80,    
  //   method: 'get'
  // };

  // var req = http.request(options, function(res) {
  //   console.log('STATUS: ' + res.statusCode);
  //   console.log('HEADERS: ' + JSON.stringify(res.headers));
  //   res.setEncoding('utf8');
  //   res.on('data', function (chunk) {
  //     console.log('BODY: ' + chunk);
  //   });
  // });
  // var awsHostname = http://169.254.169.254/latest/meta-data/public-hostname
  // var hostname = awsHostname.replace('compute-1.amazonaws.com', 'iobio.io');
  // return hostname;
}

server.close = function() {
    this.server.close();
}



module.exports = server;