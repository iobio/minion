#!/bin/bash

input=stdin
args=""
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

while getopts i:b: flag; do
  case $flag in
    i)
      input=$OPTARG
      ;;
    b)
      args="$args -b $OPTARG"
      ;;
    ?)
      exit;
      ;;
  esac
done

if [ $input == stdin ]
then
  $DIR/../bin./baiReadDepthCoverager $args
else
  cmd="curl -s \"$input\" | $DIR/../bin/bamReadDepther $args"
  eval $cmd   
fi


# while read line
# do
#    echo $line
# done