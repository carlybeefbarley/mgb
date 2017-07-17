#!/bin/bash
(
supervisor > /dev/null
if [ $? != "0" ]; then
cd && sudo yarn add supervisor
fi
)


(
export PATH=$PATH":/home/ubuntu/node_modules/.bin"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR"/../"
# run and refresh automatically on changes
supervisor ./loadTestRunner/LoadTestRunner.js
)
