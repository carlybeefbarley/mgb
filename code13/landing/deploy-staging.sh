#!/usr/bin/env sh
set -e

echo "====================================================="
echo "DEPLOY STAGING"
echo "-----------------------------------------------------"

sh ./confirm-app-build.sh

BASE_URL=/mgb/ yarn build --silent
gh-pages -d dist

echo ""
echo "  Staged:"
echo "  https://devlapse.github.io/mgb"
echo ""
