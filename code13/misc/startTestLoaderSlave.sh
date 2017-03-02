#/bin/bash
(
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export QT_QPA_PLATFORM=""
(
phantomjs --version > /dev/null 2>&1
exitCode=$?
if [ $exitCode == "127" ]; then
  echo 'Phantom not found - installing...'
  $DIR/installPhantom.sh
fi
)

(
export PATH=$PATH':~/node_modules/.bin'

cd $DIR/../app/tests/loadTestRunner
node ./slave.js test.mygamebuilder.com:8082
)
)
