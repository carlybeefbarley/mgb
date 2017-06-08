#!/bin/bash

(
cd ../misc
. ./setupAndroid.sh check
cd ../app
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export VELOCITY_DEBUG=1
export VELOCITY_DEBUG_MIRROR=1
export METEOR_PROFILE=1
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`

rm -rf .meteor/local/bundler-cache/
rm -rf .meteor/local/cordova-build/platforms/android/build/outputs/apk/

# remove old app - meteor don't update this for some reason
# rm -rf .meteor/local/cordova-build/

# For Windows
if [[ "$OSTYPE" == "msys" ]]; then
  meteor.bat build ../bundle --server http://test.mygamebuilder.com --mobile-server http://test.mygamebuilder.com
else
  meteor build ../bundle --server http://test.mygamebuilder.com --mobile-server http://test.mygamebuilder.com
fi
)
