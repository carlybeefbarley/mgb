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
	cd app/public/phaser/2.4.6/docgen/output
	ls | awk ' BEGIN { ORS = ""; print "["; } { print "\/\@"$0"\/\@"; } END { print "]"; }' | sed "s^\"^\\\\\"^g;s^\/\@\/\@^\", \"^g;s^\/\@^\"^g" > _manifest.json
)

(
#	rm -fr ./tmp/phaser
)