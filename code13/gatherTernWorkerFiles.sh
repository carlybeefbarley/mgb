#!/bin/sh
(
if [ ! -d app/node_modules/acorn/dist ]; then
  cd app
  meteor npm install acorn
  cd ..
fi

echo "copying latest acorn files"
mkdir -p app/public/lib/acorn
cp -a app/node_modules/acorn/dist/* app/public/lib/acorn

if [ ! -d app/node_modules/tern/lib ]; then
  cd app
  meteor npm install tern
  cd ..
fi

echo "copying latest tern files"
mkdir -p app/public/lib/tern
cp -a app/node_modules/tern/lib/* app/public/lib/tern
)
