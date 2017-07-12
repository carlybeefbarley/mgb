#!/usr/bin/env bash

#
# Ensure git is ready, fetch before making comparisons
#
if [[ -n $(git status --porcelain) ]]; then
  echo "Commit or stash you changes before deploying"
  exit 1
else
  echo "... working directory is clean"
fi

git fetch
local_sha=$(git rev-parse @)
remote_sha=$(git rev-parse @{u})
base_sha=$(git merge-base @ @{u})

if [[ $local_sha = $remote_sha ]]; then
  echo "... local branch is up-to-date."
elif [[ $local_sha = $base_sha ]]; then
  echo "You need to pull changes before you can deploy."
  exit 1
elif [[ $remote_sha = $base_sha ]]; then
  echo "You need to push changes before you can deploy."
  exit 1
else
  echo "Your branch has diverged from the remote, you cannot deploy."
  exit 1
fi

#
# Get git info
#
git_branch=$(git rev-parse --abbrev-ref HEAD)
git_commit_count=$(git rev-list --count ${git_branch})
git_describe=$(git describe --always)

#
# Generate Settings
#
rm settings.staging.generated.json

sed < settings.json \
"s/__MGB_GIT_BRANCH__WILL_GO_HERE__/${git_branch//\//\\/}/" | \
sed "s/__MGB_GIT_BRANCH_COMMIT_COUNT__WILL_GO_HERE__/${git_commit_count}/; " | \
sed "s/__MGB_GIT_DESCRIBE__WILL_GO_HERE__/${git_describe}/;" | \
sed 's/v2.mygamebuilder.com/staging.mygamebuilder.com/g' > settings.staging.generated.json

if [[ ! -f settings.staging.generated.json ]]; then
  echo "No generated staging file..."
  exit 1
fi

#
# Get session
# Use current user or load from METEOR_SESSION_FILE_CONTENT
#
if meteor_user=$(meteor whoami > /dev/null 2>&1); then
  echo "... logged in as $meteor_user"
elif [[ -z $METEOR_SESSION_FILE_CONTENT ]]; then
  echo ""
  echo "You must log in or create a session file, see:"
  echo "  https://docs.meteor.com/commandline.html#meteorloginlogout"
  echo ""
  echo "If using a session file, set METEOR_SESSION_FILE_CONTENT to its contents."
  echo "This script will create the session file from that variable."
  exit 1
else
  echo "... using METEOR_SESSION_FILE $METEOR_SESSION_FILE_CONTENT"
  echo "$METEOR_SESSION_FILE_CONTENT" > meteor_session.json
  METEOR_SESSION_FILE=meteor_session.json
fi

#
# Release
#
echo "... deploying"
DEPLOY_HOSTNAME=galaxy.meteor.com meteor deploy staging.mygamebuilder.com --settings settings.staging.generated.json
