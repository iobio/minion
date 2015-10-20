# Minion [![Build Status](https://travis-ci.org/iobio/minion.svg?branch=master)](https://travis-ci.org/iobio/minion) [![Coverage Status](https://coveralls.io/repos/iobio/minion/badge.svg?branch=master&service=github)](https://coveralls.io/github/iobio/minion?branch=master)
iobio server that easily turns a command line program into an iobio web service. (NOT RELEASED YET, WORK IN PROGRESS)

## Description (NOT RELEASED YET, WORK IN PROGRESS)

Minion is the server side code that powers all iobio web services. It wraps a command line program and hooks the 
stdin and stdout streams to websocket streams, enabling multiple web services to be piped together. It also handles 
the URL to command conversation and error handling. If you are wanting run a particular iobio webservice see the 
list for available web services and instructions on download and setup. Each web service has it's own copy of Minion.

## Web Services (NOT RELEASED YET, WORK IN PROGRESS)
iobio is made up of numerous micro web services that are each capable of supporting multiple apps. In the future, we'll 
allow users to develop an iobio app against our web services, but at the moment you'll need to run the web services 
that your app relies on yourself. The fastest way to start developing an iobio app is to install the web services you 
need using the install instructions below. However for production, you may want to use the dockerized web services as 
described [here](link to howto). 

#### Install (NOT RELEASED YET, WORK IN PROGRESS)
```
// where service is what you want to install (e.g. minion-samtools)
npm install minion-service
```

#### Current Web Services
| Service       | Description   | Status   |
| ------------- | --------------| :-------:|
|af				| add allele frequency information to a vcf 							| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/af) |
|bambinner		| create efficient read coverage 										| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bambinner) |
|bammerger		| merge two or more bams into a single stream 							| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bammerger) |
|bamreaddepther	| estimate read coverage based on .bai file 							| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bamreaddepther) |
|bamstatsalive	| generate stats for bam files/streams 									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bamstatsalive) |
|bamtools		| general bam utility 													| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bamtools) |
|bcftools		| general utility for vcf and bcf										| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/bcftools) |
|coverage 		| create efficient read coverage 										| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/coverage) |
|ctgapndr		| creates contig header HTSLIB requries									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/ctgapndr) |
|freebayes		| variant caller 														| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/freebayes) |
|gds			| quickly filter and recluster pca analysis generated from snpRelate 	| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/gds) |
|geneinfo		| search by gene name to get gene modal info 							| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/geneinfo) |
|samtools 		| sam/bam utility 														| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/samtools) |
|snpeff			| variant effect predictor 												| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/snpeff) |
|snprelate		| generate pca analysis from vcf files 									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/snprelate) |
|sratoolkit		| toolkit to easily access sra data 									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/sratoolkit) |
|tabix			| grab regions of a larger vcf file 									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/tabix) |
|vcfdepther		| estimate variant coverage based on .tbx file 							| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/vcfdepther) |
|vcflib			| general vcf utility 													| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/vcflib) |
|vcfstatsalive	| generate stats for vcf files/streams 									| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/vcfstatsalive) |
|vt 			| general vcf utility 													| [![Status](https://s3.amazonaws.com/iobio/web_assets/badge_up.png)](http://services.iobio.io/vt) |


## API (NOT RELEASED YET, WORK IN PROGRESS)
The full iobio API with instructions on how to build iobio apps is located at [api.iobio.io](http://api.iobio.io)

## Developers (NOT RELEASED YET, WORK IN PROGRESS)
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

#### Create Your Own Web Service
Minion wraps command line tools and converts them into iobio web services that are instantly pluggable into the 
iobio ecosystem. Minion works best on programs that take data on stdin and prints the results on stdout. 

##### Simple example
For this example we will create a service from the linux utility wc to count lines, words, and characters.

###### Create the iobio service wrapper file
Create a new file called ```wc-iobio.js``` in ```minion/services/``` and paste the following js into it.

```javascript
var port = 7100;
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

To add parameters add them as you would any iobio command. Here we add the ```-c``` option to only get back characters
```javascript
  // Create command
  var cmd = new iobio.cmd(
  	'0.0.0.0:4003',
    ['-c', url],
    { 'urlparams': {'protocol':'http'} } // use http sense input origin is a http server and not a iobio web service
  );
```


##### Tool with sub-programs
```javascript

```

##### Tool that needs flag for stdin
```javascript

```