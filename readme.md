# Minion [![Build Status](https://travis-ci.org/iobio/minion.svg?branch=master)](https://travis-ci.org/iobio/minion) [![Coverage Status](https://coveralls.io/repos/iobio/minion/badge.svg?branch=master&service=github)](https://coveralls.io/github/iobio/minion?branch=master)
iobio server that easily turns a command line program into an iobio web service.

## Description
Minion is the server side code that powers all iobio web services. It wraps a command line program and hooks the
stdin and stdout streams to websocket streams, enabling multiple web services to be piped together. It also handles
converting the URL into a command and error handling. If you are wanting run a particular iobio webservice see the minion-services repo.

## Web Services
iobio is made up of numerous micro web services that are each capable of supporting multiple apps. These web services can be mixed and matched to create a wide range of functionality. In this way a new web app can grab a set of relevant web services and then build a UI and visualization around them.

#### Public Web Services
You can develop apps against our public web services but due to resource constraints we can only run a set number of concurrent requests. Requests that can not be proccessed immediately are placed in a queue and processed in turn. If you need more power, you can install the web services yourself or contact us. All public services are located at http://services.iobio.io/

#### Local Install
If you need to install webservices locally there are two ways to do it
###### Directly
For testing it's often easier to install minion directly and place your required services in the service directory. First [install minion](#download) then place your web service definition file in the ```minion/services/``` directory. A list of web service definition files can be found in the [minion-services](https://github.com/iobio/minion-services) repo. Lastly you'll need copy the tool you are turning into a web service into the ```minion/bin/``` directory or it won't run ([see create your own web service for more details](#create-your-own-web-service)).
```
// where someService is the service definition file for a tool (e.g. samtools) you want to turn into a webservice
cd minion/
mv someService.js minion/services/
// start service
node services/someService.js
```
###### Docker
For production you may want to use [dockerized containers](http://iobio.io/2015/07/05/install-locally-via-docker/)

## Developers
If you want to improve minion or create your own webservice, you'll want to download and install minion itself.

#### Download
To get going you need to clone the repo from github
```
git clone https://github.com/iobio/minion.git
```

#### Install Dependencies
This will install all needed node modules
```
cd minion; npm install
```

#### Run Tests

```
npm test
```

#### Config File
Minion services can take a config file on startup. Otherwise the default config file ```lib/config.js``` will be used

###### To use config file
```
node someService.js --config file.config
```
###### Example config file
```JavaScript
// Minion Config file


var config = {
        platform : 'default',                   // 'default' returns nothing. 'amazon' will use amazon dns lookup to get hostname so you can use ssl
        maxConcurrentCommands: null,    // accepts a number or null. null allows unlimimited commands
        noQueueDomains: ['localhost', 'iobio.io', null], // lists domains that will never be queued
        cacheDir: 'cache'
}

module.exports = config;
```

#### Create Your Own Web Service
Minion wraps command line tools and converts them into iobio web services that are instantly pluggable into the
iobio ecosystem. Minion works best on programs that take data on stdin and prints the results on stdout.

##### Simple example
For this example we will create a service from the linux utility wc to count lines, words, and characters.

###### Create the iobio service wrapper file
Create a new file called ```wc-iobio.js``` in ```minion/services/``` and paste the following js into it.

```javascript
var port = 4003;
    minion = require('../index.js')(port);


// define tool
var tool = {
   apiVersion : "0.1",
   name : 'wc',
   path :  'wc',
   description : 'count lines, words, characters',
   exampleUrl : "http://0.0.0.0:4003/?cmd=http%253A%252F%252Fs3.amazonaws.com%252Fiobio%252Fjasmine_files%252Ftest.minion.txt"
};

// start minion socket
minion.listen(tool);
console.log('iobio server started on port ' + port);

```

###### Add tool into whitelisted directory
For security iobio only allows the execution of programs in the minion/bin directory so to enable execution of the wc utility a sym link needs to be created there. To create the symlink run the following command line. If wc is not at ```/usr/bin/``` then you can find it's location with ```which wc```.

```
$ cd minion/bin; ln -s /usr/bin/wc wc
```

###### Test new service

Start up server
```
node services/wc-iobio.js
```

To quickly test the new service, you can paste this url in the browser
```
http://0.0.0.0:4003/?cmd=http%253A%252F%252Fs3.amazonaws.com%252Fiobio%252Fjasmine_files%252Ftest.minion.txt
```

This will run the file at ```https://s3.amazonaws.com/iobio/jasmine_files/test.minion.txt``` through the wc web service. You should get back ```1 6 28```

###### Use new service
To seriously use this service, you'll want to use the ```iobio.js``` library which will create iobio urls and manage websocket connections. Here's an example

```html
	<!DOCTYPE html>
	<html>
	<head>
		<script src='iobio.js'></script>
		<script>

			// encode URL to tell the wc web service this is a input source and not a command line parameter
			// This is temporary and will be incoporated into the library
			var url = encodeURIComponent('http://s3.amazonaws.com/iobio/jasmine_files/test.minion.txt');

			// Create command
			var cmd = new iobio.cmd(
		        '0.0.0.0:4003',
		        [url], // parameters
		        { 'urlparams': {'protocol':'http'} } // use http option since input origin is a http server and not a iobio web service
		    );

		    cmd.on('data', function(results) {
				console.log(results);
				alert(results);
			})

			cmd.on('error', function(error) { console.log(error); })

			cmd.run();
		</script>
	</head>
	<body>
	</body>
	</html>
```

To add parameters, add them as you would any iobio command. Here we add the ```-c``` option to only get back characters
```javascript
  // Create command
  var cmd = new iobio.cmd(
  	'0.0.0.0:4003',
    ['-c', url],
    { 'urlparams': {'protocol':'http'} } // use http sense input origin is a http server and not a iobio web service
  );
```


##### Tool with sub-programs
./sometool subprogram --flag1 arg1
```javascript
var tool = {
   apiVersion : "0.1",
   name : 'sometool',   
   path: 'sometool/' // path to directory where subprograms live
}
```

##### Tool that need flag for stdin
./sometool --stdin --flag1 arg1 arg2
```javascript
var tool = {
   apiVersion : "0.1",
   name : 'sometool',
   path :  'sometool',
   inputOption: '--stdin' // input Options are placed before the arguments
}
```

##### Tool that need argument for stdin
./sometool --flag1 arg1 -
```javascript
var tool = {
   apiVersion : "0.1",
   name : 'sometool',   
   path: 'sometool',
   args: ['-'] // args are placed at the end of the argument list
}
```

##### CacheTransform
cacheTransform allows a stream to be piped through a transform pipe before being cached. Here's an example of using the [last-record-stream utility](https://www.npmjs.com/package/last-record-stream) to cache only the last record coming back from bamstatsalive

```JavaScript
var tool = {
   apiVersion : "0.1",
   name : 'bamstatsalive',
   path :  'bamstatsalive',
   cacheTransform: lastRecord
};
```
