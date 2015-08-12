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
```javascript


```

##### Tool with sub-programs
```javascript

```

##### Tool that needs flag for stdin
```javascript

```