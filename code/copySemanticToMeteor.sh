#!/bin/bash

cp ./semantic/dist/semantic.{js,css} ./meteor_core/client
mkdir ./meteor_core/public
cp -r ./semantic/dist/themes ./meteor_core/public/themes
