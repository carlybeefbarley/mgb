#!/usr/bin/env sh
set -e

(
rm -rf .meteor/local/bundler-cache/
./go.sh $@
)
