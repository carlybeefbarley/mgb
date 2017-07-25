#!/usr/bin/env sh
set -e

source assert-pristine-git.sh

DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy v2.mygamebuilder.com --settings settings.json
