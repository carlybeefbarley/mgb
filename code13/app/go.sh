#!/usr/bin/env sh
set -e

# if you get a ENFILES error on MacOS, then see instructions at https://gist.github.com/abernix/a7619b07b687bb97ab573b0dc30928a0
(
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/mgb2_clus001?replicaSet=rs-ds021730
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds021730-a0.mlab.com:21730,ds021730-a1.mlab.com:21730/local?replicaSet=rs-ds021730&authSource=admin
export MAIL_URL=smtp://no-reply%40mycodebuilder.com:kkfzqvqyrqwalyyk@smtp.gmail.com:465
export VELOCITY_DEBUG=1
export VELOCITY_DEBUG_MIRROR=1
# METEOR_PROFILE=n causes the METEOR build process to dump data on builds steps taking longer than n milliseconds
export METEOR_PROFILE=1000
export NODE_OPTIONS="--debug=5858" #  --inspect when meteor update node to 6.x
export ROOT_URL=http://localhost:3000
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`

. ./meteor.sh -p 0.0.0.0:3000 $@
)
