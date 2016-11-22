var utils = require('../utils/utils.js'),
    AWS = require('aws-sdk'),
    stream = require('stream');

// Set aws
AWS.config.update({
    region: "us-east-1",
    apiVersions: {s3: '2006-03-01'}
});
var s3obj = new AWS.S3();

var s3 = function(bucket, opts) {
    var self = this;
    this.options = opts || {};
    // check if opts.bucket is set
    if ( !bucket) {self.path = null; return }

    // get bucket path
    bucket = utils.functor(bucket)(this.options);

    // check if bucket and cache path from client are set
    if ( !bucket || !this.options.cache ) {self.path = null; return }

    // check if bucket is in the correct bucket
    var dirPath = require("path").resolve(bucket);
    var resolvedPath = require("path").resolve(bucket + '/' +  this.options.cache);
    if ( dirPath != resolvedPath.substring(0,dirPath.length) ) {
        var error = "cacheError: Cache directory invalid. Can only cache files in the specified cacheDir";
        // self.emit('log', error);
        // self.emit('error', error);
        self.path = null;
        return;
    }

    self.bucket = bucket;
    self.key = this.options.cache;
    self.path = resolvedPath;
}

s3.prototype.getPath = function() {
	return this.path;
}

s3.prototype.createReadStream = function(callback) {
    var self = this;
    var cachePath = this.path;

    if (cachePath == null) callback(null)
    else {
        // read cached results if present
        var params = { Bucket: self.bucket, Key: self.key };

        // request metadata to see if file exists
        s3obj.headObject(params, function (err, metadata) {
            if (err && err.code === 'NotFound') {
                var error = "cacheError: Cache file '" + cachePath + "' does not exist";
                // self.emit('log', error);
                // self.emit('error', error);
                callback(null);
            } else {
                var rs = s3obj.getObject(params).createReadStream();
                rs.on('error', function(e) {
                    console.log('Error reading S3 cache bucket: ' + e);
                })

                callback(rs);
            }
        });
    }
}

s3.prototype.createWriteStream = function() {
	var self = this;
	// self.emit('log', self.id + ': caching ' + self.opts.cachePath);
	var cachePath = self.path;
	if (cachePath == null) return null;

	// var processingExtension =  self.options.partialCache === 'true' ? '' : '.processing';
    var ws = new stream.PassThrough();
    var params = {Bucket: self.bucket, Key: self.key, Body: ws };

    s3obj.upload(params, function(err, data) {
        if (err) console.error('Error writing to s3 cache: ' + err)

        // Delete file now that it's present on s3
        if (self.delete) {
            var deleteParams = { Bucket: self.bucket, Key: self.key };
            // console.log('deleteParams = ' + deleteParams);
            s3obj.deleteObject(deleteParams, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
            });
        }
    });

    ws.on('error', function(error) {
        console.error('Error writing to s3 cache: ' + error)
    })

    return ws;
}


s3.prototype.deleteCache = function() {
    var self = this;
    var cachePath = this.path;

    if (cachePath) {
        if (self.options.partialCache === 'true') {
            //self.emit('log', 'command ' + self.id + ": " + 'leaving partial cache: ' + cachePath);
        }
        else {
            // set flag so that delete will happen again once we are sure the S3 object has been created
            self.delete = true;

            var deleteParams = { Bucket: self.bucket, Key: self.key };
            console.log('deleteParams = ' + deleteParams);
            s3obj.deleteObject(deleteParams, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
            });
        }
    }
}

s3.prototype.canCache = function() {
	if (this.path == null || this.path == undefined ) return null;
	else return true;
}


module.exports = s3;