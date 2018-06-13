#!/usr/bin/env sh
set -e

# if you get a ENFILES error on MacOS, then see instructions at https://gist.github.com/abernix/a7619b07b687bb97ab573b0dc30928a0
(
export MONGO_URL=mongodb://mgbapp:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/aie?replicaSet=rs-ds147740
export MONGO_OPLOG_URL=mongodb://oplog-reader:tiNmhsp1@ds147740-a0.mlab.com:47740,ds147740-a1.mlab.com:47740/local?replicaSet=rs-ds147740&authSource=admin
export MAIL_URL=smtps://postmaster%40mailgun.mygamebuilder.com:e812b67c37675b894d976bd50c74ba0e@smtp.mailgun.org:465
export VELOCITY_DEBUG=1
export VELOCITY_DEBUG_MIRROR=1
# METEOR_PROFILE=n causes the METEOR build process to dump data on builds steps taking longer than n milliseconds
export METEOR_PROFILE=1000
# export NODE_OPTIONS="--debug=5858" #  --inspect when meteor update node to 6.x
export ROOT_URL=http://localhost:3000
echo Bundler cache size is now `du -s -h .meteor/local/bundler-cache/`

. ./meteor.sh -p 0.0.0.0:3000 $@
)
