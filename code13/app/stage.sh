#!/usr/bin/env sh
set -e

source assert-pristine-git.sh

#
# Get git info
#
git_branch=$(git rev-parse --abbrev-ref HEAD)
git_commit_count=$(git rev-list --count ${git_branch})
git_describe=$(git describe --always)

#
# Generate Settings
#
rm -f settings.staging.generated.json

sed < settings.json \
"s/__MGB_GIT_BRANCH__WILL_GO_HERE__/${git_branch//\//\\/}/" | \
sed "s/__MGB_GIT_BRANCH_COMMIT_COUNT__WILL_GO_HERE__/${git_commit_count}/; " | \
sed "s/__MGB_GIT_DESCRIBE__WILL_GO_HERE__/${git_describe}/;" | \
sed 's/v2.mygamebuilder.com/staging.mygamebuilder.com/g' > settings.staging.generated.json

if [ ! -f settings.staging.generated.json ]; then
  echo "No generated staging file"
  exit 1
fi

#
# Get session
# Use current user or load from METEOR_SESSION_FILE_CONTENT
#
if meteor_user=$(meteor whoami 2> /dev/null); then
  echo "... logged in as: $meteor_user"
elif [ -n "$METEOR_SESSION_FILE_CONTENT" ]; then
  echo "... using METEOR_SESSION_FILE $METEOR_SESSION_FILE_CONTENT"
  echo "$METEOR_SESSION_FILE_CONTENT" > meteor_session.json
  export METEOR_SESSION_FILE=meteor_session.json
else
  echo ""
  echo "You must log in or create a session file, see:"
  echo "  https://docs.meteor.com/commandline.html#meteorloginlogout"
  echo ""
  echo "If using a session file, set METEOR_SESSION_FILE_CONTENT to its contents."
  echo "This script will create the session file from that variable."
  exit 1
fi

#
# Deploy
#
echo "... deploying"
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy staging.mygamebuilder.com --settings settings.staging.generated.json
