# script to get the phaser builds from the CDN
# See the notes in SandboxScripts.js and EditCode.js to see 
# why we prefer to have them locally (simplify CORS issues)

# List of releases is at http://phaser.io/download/archive
# I started at 2.07 which seemed more than enough

cdn="http://cdn.jsdelivr.net/phaser"
for v in 2.0.7 \
         2.1.0 2.1.1 2.1.2 2.1.3 \
         2.2.0 2.2.1 2.2.2 \
         2.3.0 \
         2.4.0 2.4.1 2.4.2 2.4.3 2.4.4 2.4.5 2.4.6 2.4.7
do 
  test -d $v || mkdir $v
  wget $cdn/$v/phaser.js -O $v/phaser.js
  wget $cdn/$v/phaser.min.js -O $v/phaser.min.js
  wget $cdn/$v/phaser.map -O $v/phaser.map
done