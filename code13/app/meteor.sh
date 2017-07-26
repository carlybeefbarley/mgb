#!/usr/bin/env sh

[ "$OS" == "Windows_NT" ] && meteor.bat $@ || meteor $@
