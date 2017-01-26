#!/bin/bash

(
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export VELOCITY_DEBUG=1 
export VELOCITY_DEBUG_MIRROR=1 
export METEOR_PROFILE=1
export CDN=http://d1asx9hahfq3ui.cloudfront.net
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`
meteor run android-device -p 0.0.0.0:3000 $@
)
