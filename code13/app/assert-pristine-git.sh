#!/usr/bin/env sh
set -e

#
# Ensure git is pristine
#
if [ -n "$(git status --porcelain)" ]; then
  echo "Commit or stash your changes"
  git status --porcelain
  exit 1
else
  echo "... working directory is clean"
fi

# fetch before making comparisons
git fetch
local_sha=$(git rev-parse @)
remote_sha=$(git rev-parse @{u})
base_sha=$(git merge-base @ @{u})

if [ "$local_sha" = "$remote_sha" ]; then
  echo "... local branch is up-to-date."
elif [ "$local_sha" = "$base_sha" ]; then
  echo "You need to pull changes."
  exit 1
elif [ "$remote_sha" = "$base_sha" ]; then
  echo "You need to push changes."
  exit 1
else
  echo "Your branch has diverged from the remote."
  exit 1
fi
