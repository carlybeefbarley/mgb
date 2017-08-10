#!/usr/bin/env sh
set -e

source assert-pristine-git.sh

export DEPLOY_HOSTNAME=galaxy.meteor.com
export NODE_ENV=production
meteor deploy v2.mygamebuilder.com --settings settings.json
