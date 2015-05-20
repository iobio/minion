var http = function(url, prog, opts) {
    var client;
    console.log("http request" + url);     
    // handle minion sources

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
        console.log('unrecognized protocol ' + url_split[0]);
        return;
    }


    console.log("requesting url: "+url);
            
    var req = client.request(url, function(res) {           
        // if (self.cmdArgs.debug) {
        //     var fs = require('fs');
        //     var ws = fs.createWriteStream('fromMinionServer.txt');
        //     res.pipe(ws);
        // }
        res.on('data', function(chunk) {
                prog.stdin.write( chunk );
        })
        res.on('end', function () {
                // might need ?
                prog.stdin.end();                 
        });

        prog.stdin.on('end', function() {
                res.destroy();
        })
    });
    req.end();
}

module.exports = http;