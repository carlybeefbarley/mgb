#!/bin/bash

# This is only needed if you wish to refresh the sematic ui build

# See http://semantic-ui.com/introduction/getting-started.html
# Specifically, to get the semantic/ folder, we had invoked
#  npm install semantic-ui --save
#  cd semantic/
#  gulp build

# If that works ok, then the following is a convenient way to make these resoures available 
#  and avoid a lot of className={style.ui + " " + style.segment} etc

cp ./semantic/dist/semantic.{js,css} ./meteor_core/client
mkdir ./meteor_core/public
cp -r ./semantic/dist/themes ./meteor_core/public/themes
