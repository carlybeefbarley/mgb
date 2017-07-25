#!/usr/bin/env sh
(
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$DIR/../app/tests/runSlave.sh
)
