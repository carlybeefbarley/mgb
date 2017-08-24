#!/usr/bin/env sh
set -e

glob="**/*.js?(on|x)"

if [ "$CI" = "true" ]; then
  prettier --config ./.prettierrc.js --list-different "$glob"
  eslint "$glob"
else
  prettier --config ./.prettierrc.js --write "$glob"
  eslint --fix "$glob"
fi
