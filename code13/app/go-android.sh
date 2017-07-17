#!/bin/bash

if [ $# -lt 1 ]; then
echo "You must specify release type:"
echo "Available options:"
echo "  local - mobile app will try to connect to local server in the same network"
echo "          probably you should specify server also e.g.: "
echo "          ./goAndroid.sh local --mobile-server='http://192.168.1.2:3000'"
echo ""
echo "  test - mobile app will connect to test server"
echo ""
echo "  release - mobile app will connect to v2.mygamebuilder.com (NOT WORKING - needs mobile branch to be merged into master)"
echo ""
echo "Or you can manually specify mobile server:"
echo "./goAndroid.sh release --mobile-server='http://staging.mygamebuilder.com'"
exit 1
fi

server='http://192.168.8.102:3000'


case "$1" in
  'local')
    #try to guess
    #server=http://`ip route get 8.8.8.8 | tr -s ' ' | cut -d' ' -f7`:3000
    #if [ "$server" == "" ]; then
      server='http://192.168.8.102:3000'
    #fi
    ;;
  'test')
    server='http://test.mygamebuilder.com'
    ;;
  'release')
    server='http://v2.mygamebuilder.com'
    ;;
esac

if [ $# -lt 2 ]; then
  args="--mobile-server=${server}"
fi

(
#if [ `uname` != 'Darwin' ]; then
  cd ../misc
  . ./setupAndroid.sh check
  # start adb just in case
  adb devices
  cd ../app
#fi
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export VELOCITY_DEBUG=1
export VELOCITY_DEBUG_MIRROR=1
export METEOR_PROFILE=1

echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`
rm -rf .meteor/local/bundler-cache/

# remove old app - meteor don't update this for some reason ( because app versions match )
rm -rf .meteor/local/cordova-build/www/application/


echo "Starting app with args: $args ${@:2}"

# For Windows
if [[ "$OSTYPE" == "msys" ]]; then
  meteor.bat run android-device $args ${@:2}
else
  meteor run android-device $args ${@:2}
fi
)

