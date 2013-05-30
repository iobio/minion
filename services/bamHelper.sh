#!/bin/bash

bamtools="/Users/chase/Tools/qbamtools/bin/qbamtools"
region=$1;

#/Users/chase/Tools/qbamtools/bin/qbamtools convert -format json -in <(samtools view -u http://s3.amazonaws.com/1000genomes/data/HG00096/alignment/HG00096.chrom11.ILLUMINA.bwa.GBR.low_coverage.20111114.bam 11:108473-188673)

cmd="" 

for i in ${@:2}
do   
   cmd=$cmd" -in <(samtools view -u $i $region)"
done

# cmd="-in <(samtools view -u http://s3.amazonaws.com/1000genomes/data/HG00096/alignment/HG00096.chrom11.ILLUMINA.bwa.GBR.low_coverage.20111114.bam 11:108473-188673)"

cmd="/Users/chase/Tools/qbamtools/bin/qbamtools merge "$cmd
eval $cmd
