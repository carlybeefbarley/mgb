#!/bin/bash
# this file will setup brand new ubuntu ami - used for template for other slaves
# you still need to create default ubuntu instance manually
# this script can be used to update slave directly (but it's not it main purpose)

if [ $# -lt 3 ]; then
  echo "usage:"
  echo "./setupNewAMI.sh ec2-ip-address.compute-1.amazonaws.com masterCertificate.pem amiCertificate.pem"
  exit 0
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

awsUri=$1
awsCert=$2
cert=$3

if [ ! -f $cert ]; then
  echo "Cannot find certificate! "$cert
  exit 1
fi
if [ ! -f $awsCert ]; then
  echo "Cannot aws certificate! "$aws
  exit 1
fi

echo "copying cert to instance"
scp -i $awsCert $cert ubuntu@${awsUri}:~/master.pem

echo "executing update script on instance"
ssh -i $awsCert ubuntu@${awsUri} 'bash -s' < ${DIR}/updateSlave.sh

echo "executing setup script on instance"
ssh -i $awsCert ubuntu@${awsUri} <<'ENDSSH'
cd mgb
./setup.ubuntu.sh
ENDSSH

