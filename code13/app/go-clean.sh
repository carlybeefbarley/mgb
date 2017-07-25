#!/usr/bin/env sh

(
rm -rf .meteor/local/bundler-cache/
./go.sh $@
)
