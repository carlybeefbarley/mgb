#!/usr/bin/env sh
set -e

deploy_env=$1

usage() {
  echo ""
  echo "Usage: sh deploy.sh <staging|production|aie>"
}

# ----------------------------------------
# Validation
# ----------------------------------------
sh assert-pristine-git.sh

if [ "$deploy_env" != "staging" ] && [ "$deploy_env" != "production" ] && [ "$deploy_env" != "aie" ]; then
  echo "Bad deploy environment: \"$deploy_env\""
  usage
  exit 1
fi

# ----------------------------------------
# Create settings.json
# ----------------------------------------
source_settings_filename="settings.json"
generated_settings_filename="settings.$deploy_env.generated.json"

if [ "$deploy_env" = "staging" ]; then
  subdomain="staging"
elif [ "$deploy_env" = "production" ]; then
  subdomain="v2"
elif [ "$deploy_env" = "aie" ]; then
  subdomain="aie"
fi

git_branch=$(git rev-parse --abbrev-ref HEAD)
git_commit_count=$(git rev-list --count ${git_branch})
git_describe=$(git describe --always)

escaped_branch=$(echo ${git_branch} | sed -e "s:/:\\\/:g")

cat "$source_settings_filename" | \
sed \
-e "s:__MGB_DEPLOY_ENV__:$deploy_env:g" \
-e "s:__MGB_GIT_BRANCH__:$escaped_branch:g" \
-e "s:__MGB_GIT_BRANCH_COMMIT_COUNT__:$git_commit_count:g" \
-e "s:__MGB_GIT_DESCRIBE__:$git_describe:g" \
-e "s:__ORIGIN_DOMAIN_NAME__:$subdomain:g" \
-e "s:__ORIGIN_ID__:$subdomain:g" \
> "$generated_settings_filename"

# ----------------------------------------
# Get Meteor Session
# Use current user or load from METEOR_SESSION_FILE_CONTENT
# ----------------------------------------
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

# ----------------------------------------
# Deploy
# ----------------------------------------
echo "... deploying"
export DEPLOY_HOSTNAME=galaxy.meteor.com
export NODE_ENV=production
meteor deploy "$subdomain.mygamebuilder.com" --settings "$generated_settings_filename"