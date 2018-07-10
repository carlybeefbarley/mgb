#!/usr/bin/env sh
set -e

if [ "$OS" = "Windows_NT" ]; then
  meteor.bat $@
else
  meteor $@
fi
