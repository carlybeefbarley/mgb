#!/usr/bin/env sh
(
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

cd
yarn add phantomjs-prebuilt #package phantomjs is deprecated
)
