
var minionClient = {};

// url methods
minionClient.url = {};

minionClient.url.parse = function(url) {    
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
};

// allows use inside of node as a module
module.exports = minionClient;