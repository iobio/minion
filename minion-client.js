// hack to allow this code to be used both in node and the browser
var module = module || {};

var minionClient = {};

// url methods
minionClient.url = {};
minionClient.url.construct = function(host, params) {
   var url = host + "?";
   for ( var x in params ) {
      url += x + "=" + params[x] + "&"
   }
   // remove trailing &
   url = url.slice(0, -1);
   return url;
};
minionClient.url.parse = function(url) {
   var parsed = { query: {} };
   parsed.protocol = url.split('://')[0]
   console.log('parUrl = ' + url)
   var parts = url.split(/\?(.+)?/);
   parsed.host = parts[0];
   var urlParams = parts[1]
   console.log('parts1 = ' + urlParams);

   if (!urlParams || urlParams.length == 0) {return parsed}
   console.log('urlParams = ' + urlParams);
   var parameterPairs = urlParams.split('&');
   var x;
   for (x in parameterPairs) {
      var parameterPair = parameterPairs[x];
      console.log('parameterPair = ' + parameterPair);
      parameterPair = parameterPair.split(/=(.+)?/);
      parsed.query[parameterPair[0]] = decodeURI(parameterPair[1]);
   }
   return parsed;   
};

// allows use inside of node as a module
module.exports = minionClient;