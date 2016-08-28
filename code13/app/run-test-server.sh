#!/bin/bash

(
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export VELOCITY_DEBUG=1 
export VELOCITY_DEBUG_MIRROR=1 
export METEOR_PROFILE=1
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`
export TOOL_NODE_FLAGS="--harmony_proxies"
meteor test --debug-port 8585 --driver-package practicalmeteor:mocha --port 3080 $@
#meteor test --driver-package practicalmeteor:mocha --port 3080 $@
)
