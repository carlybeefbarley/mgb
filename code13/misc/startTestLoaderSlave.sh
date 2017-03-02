#!/bin/bash
(
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../app/tests/loadTestRunner
node ./slave.js test.mygamebuilder.com:8082
)
