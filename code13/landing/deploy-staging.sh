#!/usr/bin/env sh
set -e

sh ./confirm-app-build.sh

BASE_URL=/mgb/ yarn run build --silent
gh-pages -d dist
