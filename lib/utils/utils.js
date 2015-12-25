var utils = {}


utils.lineReader = function(prog, callback) {
    var rl = require('readline').createInterface({
        input: prog.stdout,
        terminal: false
    });
    
    rl.on('line', function (line) {
        callback(line);
    });
    
}

utils.chunkReader = function(prog, callback) {
    prog.stdout.on('data', function (chunk) {
        callback(chunk);
      });
}

utils.parseUrlParams = function(url) {
    var parsed = { query: {} };
    parsed.protocol = url.split('://')[0]    
    var parts = url.split(/\?(.+)?/);
    parsed.host = parts[0];
    if(parsed.host == "http://client") parsed.isClient = true;
    var urlParams = parts[1]    

    if (!urlParams || urlParams.length == 0) {return parsed}    
    // split on & while ignoring everything inside double quotes
    var parameterPairs = decodeURI(urlParams).match(/(?:[^&"]+|"[^"]*")+/g).map(function(d) { return encodeURI(d); })
    var x;
    for (x in parameterPairs) {
        var parameterPair = parameterPairs[x];        
        parameterPair = parameterPair.split(/=(.+)?/);
        parsed.query[parameterPair[0]] = decodeURI(parameterPair[1]);
    }
    return parsed;   
}

// If the specified value is a function, returns the specified value. 
// Otherwise, returns a function that returns the specified value. 
// This method is used internally as a lazy way of upcasting constant values to functions,
// in cases where a property may be specified either as a function or a constant. 
utils.functor = function(v) {
  return typeof v === "function" ? v : function() { return v; };
}

module.exports = utils;