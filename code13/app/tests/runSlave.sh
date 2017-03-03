#!/bin/bash
(
# this is required so we can access latest node provided by nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm

# we don't use root account - so all npm modules (phantomjs) binaries are here
export PATH=$PATH":$HOME/node_modules/.bin"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# phantomjs has strange bug on Arch Linux (or KDE)
export QT_QPA_PLATFORM=""
phantomjs --version # show phantom version - more usable than hidden errors
exitCode=$?
# install phantomjs if none has been found
if [ $exitCode == "127" ]; then
  echo 'Phantom not found - installing...'
  $DIR/installPhantom.sh
fi

# start actual slave script
cd $DIR/loadTestRunner
node ./slave.js test.mygamebuilder.com:8082
)
