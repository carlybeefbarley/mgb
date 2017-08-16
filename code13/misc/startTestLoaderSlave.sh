#!/usr/bin/env sh
set -e

(
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
$DIR/../app/tests/runSlave.sh
)
