var utils = require('../utils/utils.js'),
	fs = require('fs'),
	mkdirp = require('mkdirp');

var local = function(cacheDir, opts) {
    var self = this;
    this.options = opts || {};
    // check if opts.cacheDir is set
    if ( !cacheDir) {self.path = null; return }

    // get cache directory
    cacheDir = utils.functor(cacheDir)(this.options);

    // check if cache directory and cache path from client are set
    if ( !cacheDir || !this.options.cache ) {self.path = null; return }

    // check if cache directory is in the correct directory
    var dirPath = require("path").resolve(cacheDir);
    var resolvedPath = require("path").resolve(cacheDir + '/' +  this.options.cache);
    if ( dirPath != resolvedPath.substring(0,dirPath.length) ) {
        var error = "cacheError: Cache directory invalid. Can only cache files in the specified cacheDir";
        // self.emit('log', error);
        // self.emit('error', error);
        self.path = null;
        return;
    }

    self.path = resolvedPath;
}

local.prototype.getPath = function() {
	return this.path;
}

local.prototype.createReadStream = function(callback) {
    var cachePath = this.path;

    if (cachePath == null) callback(null)
    else {
        // read cached results if present
        var rs = fs.createReadStream(cachePath);
        rs.on('open', function() {
            callback(rs);
        })

        // if cached file doesn't exist then readstream will error
        rs.on('error', function(err) {
            var error = "cacheError: Cache file '" + cachePath + "' does not exist";
            // self.emit('log', error);
            // self.emit('error', error);
            callback(null);
        })
    }
}

local.prototype.createWriteStream = function() {
	var self = this;
	// self.emit('log', self.id + ': caching ' + self.opts.cachePath);
	var cachePath = self.path;
	if (cachePath == null) return null;

	var cacheDir = require('path').dirname(cachePath)
	mkdirp( cacheDir , function (err) {if (err) console.error(err)});
	var processingExtension =  self.options.partialCache === 'true' ? '' : '.processing';

	var ws = fs.createWriteStream(cachePath + processingExtension, {flags: 'wx', mode:0600})
	ws.on('error', function(error) {
	    if (error.code != 'EEXIST')
	        console.error(error)
	})

	// Remove .processing extension from cache file when cache has finished being written
	ws.on('finish', function() {
	    if (self.options.partialCache !== 'true')
	        fs.rename(cachePath + processingExtension, cachePath, function(err) {
	            if ( err ) console.error('ERROR Renaming Cache file: ' + err);
	        })
	})

	return ws;
}


local.prototype.deleteCache = function() {
    var self = this;
    var cachePath = this.path;

    if (cachePath) {
        if (self.options.partialCache === 'true') {
            //self.emit('log', 'command ' + self.id + ": " + 'leaving partial cache: ' + cachePath);
        }
        else {
            // self.emit('log', 'command ' + self.id + ": " + 'deleting cache: ' + cachePath);
            fs.unlink(cachePath + '.processing', function() {});
            fs.unlink(cachePath, function() {});
        }
    }
}

local.prototype.canCache = function() {
	if (this.path == null || this.path == undefined ) return null;
	else return true;
}


module.exports = local;