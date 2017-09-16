#!/usr/bin/env sh
set -e

echo "====================================================="
echo "DEPLOY STAGING"
echo "-----------------------------------------------------"

sh ./confirm-app-build.sh

export MGB_LANDING_HOST=devlapse.github.io
export MGB_LANDING_BASE_URL=/mgb/

yarn build --silent
gh-pages -d dist

echo ""
echo "  Staged:"
echo "  https://$MGB_LANDING_HOST"
echo ""
