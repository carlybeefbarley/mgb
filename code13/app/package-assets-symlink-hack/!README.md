This folder is here because npm/import in Meteor 1.3 does not support asset files:

See https://github.com/meteor/meteor/issues/6037

The workaround for now is to include any required asset files via symlinks or copies..

eg. 

ln -s ../node_modules/codemirror/lib/codemirror.css .