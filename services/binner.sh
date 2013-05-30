#!/bin/bash

min=$1
max=$2
totalBins=$3
length=$((max-min+1))
binEvery=$((length/totalBins))
n=1
bin=0

while read LINE; do
   if [ $n == $binEvery ]; then
      n=1
      bin=$((bin+LINE))
      echo $((bin/binEvery))
      bin=0
   else
      n=$((n+1))
      bin=$((bin+LINE))
   fi   
done

exit 0