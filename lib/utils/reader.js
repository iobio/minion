var reader = {}


reader.lineReader = function(prog, callback) {
    var rl = require('readline').createInterface({
     input: prog.stdout,
     terminal: false
    });
    
    rl.on('line', function (line) {
      callback(line);
    });
    
}

reader.chunkReader = function(prog, callback) {
    prog.stdout.on('data', function (chunk) {
        callback(chunk);
      });
}

module.exports = reader;