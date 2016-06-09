var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits;

var http = function() {
    // Call EventEmitter constructor
    EventEmitter.call(this);
    this.emit('log', 'http request');
}

// inherit eventEmitter
inherits(http, EventEmitter);

http.prototype.run = function(cmd, prog, opts) {
    var url = cmd.url;

    var client;

    if (url.slice(0, 5) == "ws://") {
        client = require('follow-redirects').http;
        url = "http://" + url.split(/^ws:\/\//)[1];
    }
    else if (url.slice(0, 7) == "http://") {
        client = require('follow-redirects').http;
    }
    else if (url.slice(0, 6) == "wss://") {
        client = require('follow-redirects').https;
        url = "https://" + url.split(/^wss:\/\//)[1];
    }
    else if (url.slice(0, 8) == "https://") {
        client = require('follow-redirects').https;
    }
    else {
        this.emit('log', 'unrecognized protocol ' + url_split[0]);
        return;
    }

    this.emit('log', 'requesting url = ' + url);

    var req = client.request(url, function(res) {

        // pipe results of upstream command to
        // argument (fifo placeholder) in current command
        res.pipe(cmd.fifoStream);

        fStream.on('end', function() {
                res.destroy();
        })
    });
    req.end();
}

module.exports = http;