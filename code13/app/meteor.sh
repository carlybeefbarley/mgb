#!/usr/bin/env sh

if [ "$OS" == "Windows_NT" ]; then
  meteor.bat $@
else
  meteor $@
fi
