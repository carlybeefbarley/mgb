#!/usr/bin/env sh
(
if [ ! -d ../app/node_modules/acorn/dist ]; then
  cd app
  meteor yarn add acorn
  cd ..
fi

echo "copying latest acorn files"
mkdir -p ../app/public/lib/acorn
cp -a ../app/node_modules/acorn/dist/* ../app/public/lib/acorn

if [ ! -d ../app/node_modules/tern/lib ]; then
  cd app
  meteor yarn add tern
  cd ..
fi

#echo "copying latest tern files"
#mkdir -p ../app/public/lib/tern
#cp -a ../app/node_modules/tern/{lib,plugin} ../app/public/lib/tern
)
