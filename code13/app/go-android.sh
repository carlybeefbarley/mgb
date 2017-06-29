#!/bin/bash

(
#if [ `uname` != 'Darwin' ]; then
  cd ../misc
  . ./setupAndroid.sh check
  cd ../app
#fi
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export VELOCITY_DEBUG=1
export VELOCITY_DEBUG_MIRROR=1
export METEOR_PROFILE=1
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`
rm -rf .meteor/local/bundler-cache/
# remove old app - meteor don't update this for some reason
rm -rf .meteor/local/cordova-build/www/application/


server='http://test.mygamebuilder.com'
server='http://192.168.8.100:3000'

# For Windows
if [[ "$OSTYPE" == "msys" ]]; then
  meteor.bat run android-device --mobile-server $server $@
else
  meteor run android-device --mobile-server $server $@
fi
)

