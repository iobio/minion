# Minion [![Build Status](https://travis-ci.org/iobio/minion.svg?branch=master)](https://travis-ci.org/iobio/minion) [![Coverage Status](https://coveralls.io/repos/iobio/minion/badge.svg?branch=master)](https://coveralls.io/r/iobio/minion?branch=master)
iobio server that easily turns a command line program into an iobio web service.

## Description

Minion is the server side code that powers all iobio web services. It wraps a command line program and hooks the 
stdin and stdout streams to websocket streams, enabling multiple web services to be piped together. It also handles 
the URL to command conversation and error handling. If you are wanting run a particular iobio webservice see the 
list for available web services and instructions ondownload and setup. Each web service has it's own copy of Minion.

## Web Services
Put a list here with links to install instructions and have a badge on the right that shows stats (e.g. up/down)
#### Install
```
// where service is what you want to install (e.g. minion-samtools)
npm install minion-service
```

#### Current Web Services
| Service       | Description   | Status   |
| ------------- | --------------| :-------:|
|af				| add allele frequency information to a vcf 							| up |
|bambinner		| create efficient read coverage 										| up |
|bammerger		| merge two or more bams into a single stream 							| up |
|bamreaddepther	| estimate read coverage based on .bai file 							| up |
|bamstatsalive	| generate stats for bam files/streams 									| up |
|bamtools		| general bam utility 													| up |
|bcftools		| general utility for vcf and bcf										| up |
|coverage 		| create efficient read coverage 										| up |
|ctgapndr		| creates contig header HTSLIB requries									| up |
|freebayes		| variant caller 														| up |
|gds			| quickly filter and recluster pca analysis generated from snpRelate 	| up |
|geneinfo		| search by gene name to get gene modal info 							| up |
|samtools 		| sam/bam utility 														| up |
|snpeff			| variant effect predictor 												| up |
|snprelate		| generate pca analysis from vcf files 									| up |
|sratoolkit		| toolkit to easily access sra data 									| up |
|tabix			| grab regions of a larger vcf file 									| up |
|vcfdepther		| estimate variant coverage based on .tbx file 							| up |
|vcflib			| general vcf utility 													| up |
|vcfstatsalive	| generate stats for vcf files/streams 									| up |
|vt 			| general vcf utility 													| up |


## API
The full iobio API is maintained here

## Developers

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