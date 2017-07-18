# this file needs to be reviewed

exit 0

(
	mkdir tmp
	cd tmp
	git clone git@github.com:photonstorm/phaser.git
	cd phaser
	git checkout tags/v2.4.6
)


(
	mkdir -p -v app/public/phaser/2.4.6/docgen/output
	cp tmp/phaser/resources/docgen/output/*.json app/public/phaser/2.4.6/docgen/output
)

(
  node ./gatherPhaserDefs.js
	cd app/public/phaser/2.4.6/docgen/output
	ls | awk ' BEGIN { ORS = ""; print "["; } { print "\/\@"$0"\/\@"; } END { print "]"; }' | sed "s^\"^\\\\\"^g;s^\/\@\/\@^\", \"^g;s^\/\@^\"^g" > _manifest.json
)


(
	cd tmp
	git clone lodash
	cd lodash
	yarn add jsdoc
	node ./node_modules/jsdoc/jsdoc.js -t ./node_modules/jsdoc/templates/haruki/ -d console lodash.js  > ../../app/public/lodash.jsdoc.json
)


(
#	rm -fr ./tmp
)
